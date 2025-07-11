import type { protocol, IPitcherClient } from "@codesandbox/pitcher-client";
import { Barrier, DisposableStore } from "@codesandbox/pitcher-common";
import { Disposable } from "../../utils/disposable";
import { Emitter } from "../../utils/event";

type ShellSize = { cols: number; rows: number };

export type ShellRunOpts = {
  dimensions?: ShellSize;
  name?: string;
  env?: Record<string, string>;
  cwd?: string;
  /**
   * Run the command in the global session instead of the current session. This makes
   * any environment variables available to all users of the Sandbox.
   */
  asGlobalSession?: boolean;
};

export type CommandStatus =
  | "RUNNING"
  | "FINISHED"
  | "ERROR"
  | "KILLED"
  | "RESTARTING";

const DEFAULT_SHELL_SIZE = { cols: 128, rows: 24 };

export class Commands {
  private disposable = new Disposable();
  constructor(
    sessionDisposable: Disposable,
    private pitcherClient: IPitcherClient,
    private env: Record<string, string> = {}
  ) {
    sessionDisposable.onWillDispose(() => {
      this.disposable.dispose();
    });
  }

  /**
   * Create and run command in a new shell. Allows you to listen to the output and kill the command.
   */
  async runBackground(command: string | string[], opts?: ShellRunOpts) {
    const disposableStore = new DisposableStore();
    const onOutput = new Emitter<string>();
    disposableStore.add(onOutput);

    command = Array.isArray(command) ? command.join(" && ") : command;

    const allEnv = Object.assign(this.env, opts?.env ?? {});

    // TODO: use a new shell API that natively supports cwd & env
    let commandWithEnv = Object.keys(allEnv).length
      ? `env ${Object.entries(allEnv)
          .map(([key, value]) => `${key}=${value}`)
          .join(" ")} ${command}`
      : command;

    if (opts?.cwd) {
      commandWithEnv = `cd ${opts.cwd} && ${commandWithEnv}`;
    }

    const shell = await this.pitcherClient.clients.shell.create(
      this.pitcherClient.workspacePath,
      opts?.dimensions ?? DEFAULT_SHELL_SIZE,
      commandWithEnv,
      opts?.asGlobalSession ? "COMMAND" : "TERMINAL",
      true
    );

    if (shell.status === "ERROR" || shell.status === "KILLED") {
      throw new Error(`Failed to create shell: ${shell.buffer.join("\n")}`);
    }

    const details = {
      type: "command",
      command,
      name: opts?.name,
    };

    if (shell.status !== "FINISHED") {
      // Only way for us to differentiate between a command and a terminal
      this.pitcherClient.clients.shell.rename(
        shell.shellId,
        // We embed some details in the name to properly show the command that was run
        // , the name and that it is an actual command
        JSON.stringify(details)
      );
    }

    const cmd = new Command(
      this.pitcherClient,
      shell as protocol.shell.CommandShellDTO,
      details
    );

    return cmd;
  }

  /**
   * Run a command in a new shell and wait for it to finish, returning its output.
   */
  async run(command: string | string[], opts?: ShellRunOpts): Promise<string> {
    const cmd = await this.runBackground(command, opts);

    return cmd.waitUntilComplete();
  }

  /**
   * Get all running commands.
   */
  getAll(): Command[] {
    const shells = this.pitcherClient.clients.shell.getShells();

    return shells
      .filter(
        (shell) => shell.shellType === "TERMINAL" && isCommandShell(shell)
      )
      .map(
        (shell) =>
          new Command(this.pitcherClient, shell, JSON.parse(shell.name))
      );
  }
}

export function isCommandShell(
  shell: protocol.shell.ShellDTO
): shell is protocol.shell.CommandShellDTO {
  try {
    const parsed = JSON.parse(shell.name);

    return parsed.type === "command";
  } catch {
    return false;
  }
}

export class Command {
  private disposable = new Disposable();
  // TODO: differentiate between stdout and stderr, also send back bytes instead of
  // strings
  private onOutputEmitter = this.disposable.addDisposable(
    new Emitter<string>()
  );
  /**
   * An event that is emitted when the command outputs something.
   */
  public readonly onOutput = this.onOutputEmitter.event;

  private onStatusChangeEmitter = this.disposable.addDisposable(
    new Emitter<CommandStatus>()
  );
  /**
   * An event that is emitted when the command status changes.
   */
  public readonly onStatusChange = this.onStatusChangeEmitter.event;
  private barrier = new Barrier<void>();

  private output: string[] = [];

  /**
   * The status of the command.
   */
  #status: CommandStatus = "RUNNING";

  get status(): CommandStatus {
    return this.#status;
  }

  set status(value: CommandStatus) {
    if (this.#status !== value) {
      this.#status = value;
      this.onStatusChangeEmitter.fire(this.#status);
    }
  }

  /**
   * The command that was run
   */
  command: string;

  /**
   * The name of the command
   */
  name?: string;

  constructor(
    private pitcherClient: IPitcherClient,
    private shell: protocol.shell.ShellDTO & { buffer?: string[] },
    details: { command: string; name?: string }
  ) {
    this.command = details.command;
    this.name = details.name;

    this.disposable.addDisposable(
      pitcherClient.clients.shell.onShellExited(({ shellId, exitCode }) => {
        if (shellId === this.shell.shellId) {
          this.status = exitCode === 0 ? "FINISHED" : "ERROR";
          this.barrier.open();
        }
      })
    );

    this.disposable.addDisposable(
      pitcherClient.clients.shell.onShellTerminated(({ shellId }) => {
        if (shellId === this.shell.shellId) {
          this.status = "KILLED";
          this.barrier.open();
        }
      })
    );

    this.disposable.addDisposable(
      this.pitcherClient.clients.shell.onShellOut(({ shellId, out }) => {
        if (shellId !== this.shell.shellId || out.startsWith("[CODESANDBOX]")) {
          return;
        }

        this.onOutputEmitter.fire(out);

        this.output.push(out);
        if (this.output.length > 1000) {
          this.output.shift();
        }
      })
    );
  }

  /**
   * Open the command and get its current output, subscribes to future output
   */
  async open(dimensions = DEFAULT_SHELL_SIZE): Promise<string> {
    const shell = await this.pitcherClient.clients.shell.open(
      this.shell.shellId,
      dimensions
    );

    this.output = shell.buffer;

    return this.output.join("\n");
  }

  /**
   * Wait for the command to finish with its returned output
   */
  async waitUntilComplete(): Promise<string> {
    await this.barrier.wait();

    if (this.status === "FINISHED") {
      return this.output.join("\n");
    }

    throw new Error(`Command ERROR: ${this.output.join("\n")}`);
  }

  // TODO: allow for kill signals
  /**
   * Kill the command and remove it from the session.
   */
  async kill(): Promise<void> {
    this.disposable.dispose();
    await this.pitcherClient.clients.shell.delete(this.shell.shellId);
  }

  /**
   * Restart the command.
   */
  async restart(): Promise<void> {
    if (this.status !== "RUNNING") {
      throw new Error("Command is not running");
    }

    await this.pitcherClient.clients.shell.restart(this.shell.shellId);
  }
}
