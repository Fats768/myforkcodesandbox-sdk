import { promises as fs } from "fs";
import path from "path";
import { isBinaryFile } from "isbinaryfile";
import readline from "readline";

import { Disposable, DisposableStore } from "@codesandbox/pitcher-common";
import { createClient, createConfig, type Client } from "@hey-api/client-fetch";
import ora from "ora";
import type * as yargs from "yargs";

import { VMTier, CodeSandbox, Sandbox } from "../../";

import {
  sandboxFork,
  vmCreateTag,
  vmListClusters,
  VmUpdateSpecsRequest,
} from "../../api-clients/client";
import { getDefaultTemplateId, handleResponse } from "../../utils/api";
import { BASE_URL, getApiKey } from "../utils/constants";
import { hashDirectory } from "../utils/hash";
import { startVm } from "../../Sandboxes";

export type BuildCommandArgs = {
  directory: string;
  name?: string;
  path?: string;
  ports?: number[];
  fromSandbox?: string;
  skipFiles?: boolean;
  vmTier?: VmUpdateSpecsRequest["tier"];
};

export const buildCommand: yargs.CommandModule<
  Record<string, never>,
  BuildCommandArgs
> = {
  command: "build <directory>",
  describe:
    "Build an efficient memory snapshot from a directory. This snapshot can be used to create sandboxes quickly.",
  builder: (yargs: yargs.Argv) =>
    yargs
      .option("from-sandbox", {
        describe: "Use and update an existing sandbox as a template",
        type: "string",
      })
      .option("name", {
        describe: "Name for the resulting sandbox that will serve as snapshot",
        type: "string",
      })
      .option("ports", {
        describe: "Ports to wait for to open before creating snapshot",
        type: "number",
        array: true,
      })
      .option("path", {
        describe:
          "Which folder (in the dashboard) the sandbox will be created in",
        default: "SDK-Templates",
        type: "string",
      })
      .option("vm-tier", {
        describe: "Base specs to use for the template sandbox",
        type: "string",
        choices: VMTier.All.map((t) => t.name),
      })
      .positional("directory", {
        describe: "Path to the project that we'll create a snapshot from",
        type: "string",
        demandOption: "Path to the project is required",
      }),

  handler: async (argv) => {
    const API_KEY = getApiKey();
    const apiClient: Client = createClient(
      createConfig({
        baseUrl: BASE_URL,
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      })
    );

    try {
      const clustersData = handleResponse(
        await vmListClusters({
          client: apiClient,
        }),
        "Failed to list clusters"
      );

      const clusters = clustersData.clusters;

      const spinner = ora({ stream: process.stdout });
      let spinnerMessages: string[] = clusters.map(() => "");

      function updateSpinnerMessage(
        index: number,
        message: string,
        sandboxId?: string
      ) {
        spinnerMessages[index] = `[cluster: ${
          clusters[index].slug
        }, sandboxId: ${sandboxId || "-"}]: ${message}`;

        return `\n${spinnerMessages.join("\n")}`;
      }

      const sandboxIds = await Promise.all(
        clusters.map(async ({ host: cluster, slug }, index) => {
          const clusterApiClient: Client = createClient(
            createConfig({
              baseUrl: BASE_URL,
              headers: {
                Authorization: `Bearer ${API_KEY}`,
                "x-pitcher-manager-url": `https://${cluster}/api/v1`,
              },
            })
          );
          const sdk = new CodeSandbox(API_KEY, {
            baseUrl: BASE_URL,
            headers: {
              "x-pitcher-manager-url": `https://${cluster}/api/v1`,
            },
          });

          let sandboxId: string | undefined;

          try {
            const { hash, files: filePaths } = await hashDirectory(
              argv.directory
            );
            const shortHash = hash.slice(0, 6);
            const tag = `sha:${shortHash}-${slug}`;

            spinner.start(updateSpinnerMessage(index, "Creating sandbox..."));
            sandboxId = await createSandbox({
              apiClient: clusterApiClient,
              shaTag: tag,
              fromSandbox: argv.fromSandbox,
              collectionPath: argv.path,
              name: argv.name,
              vmTier: argv.vmTier
                ? VMTier.fromName(argv.vmTier)
                : VMTier.fromName("Micro"),
            });

            spinner.start(
              updateSpinnerMessage(index, "Starting sandbox...", sandboxId)
            );

            // This is a hack, we need to tell the global scheduler that the VM is running
            // in a different cluster than the one it'd like to default to.
            const baseUrl = apiClient
              .getConfig()
              .baseUrl?.replace("api", "global-scheduler");

            await fetch(
              `${baseUrl}/api/v1/cluster/${sandboxId}?preferredManager=${cluster}`
            ).then((res) => res.json());

            const startResponse = await startVm(clusterApiClient, sandboxId, {
              vmTier: VMTier.fromName("Micro"),
            });
            let sandbox = new Sandbox(
              sandboxId,
              clusterApiClient,
              startResponse
            );
            let session = await sandbox.connect();

            spinner.start(
              updateSpinnerMessage(
                index,
                "Writing files to sandbox...",
                sandboxId
              )
            );
            let i = 0;
            for (const filePath of filePaths) {
              i++;
              const fullPath = path.join(argv.directory, filePath);
              const content = await fs.readFile(fullPath);
              const dirname = path.dirname(filePath);
              await session.fs.mkdir(dirname, true);
              await session.fs.writeFile(filePath, content, {
                create: true,
                overwrite: true,
              });
            }

            spinner.start(
              updateSpinnerMessage(index, "Restarting sandbox...", sandboxId)
            );
            sandbox = await sdk.sandboxes.restart(sandbox.id, {
              vmTier: argv.vmTier
                ? VMTier.fromName(argv.vmTier)
                : VMTier.fromName("Micro"),
            });
            session = await sandbox.connect();

            const disposableStore = new DisposableStore();

            const steps = await session.setup.getSteps();

            for (const step of steps) {
              const buffer: string[] = [];

              try {
                spinner.start(
                  updateSpinnerMessage(
                    index,
                    `Running setup ${steps.indexOf(step) + 1} / ${
                      steps.length
                    } - ${step.name}...`,
                    sandboxId
                  )
                );

                disposableStore.add(
                  step.onOutput((output) => {
                    buffer.push(output);
                  })
                );

                const output = await step.open();

                buffer.push(...output.split("\n"));

                await step.waitUntilComplete();
              } catch (error) {
                throw new Error(`Setup step failed: ${step.name}`);
              }
            }

            disposableStore.dispose();

            const ports = argv.ports || [];
            const updatePortSpinner = () => {
              const isMultiplePorts = ports.length > 1;
              spinner.start(
                updateSpinnerMessage(
                  index,
                  `Waiting for ${
                    isMultiplePorts ? "ports" : "port"
                  } ${ports.join(", ")} to open...`,
                  sandboxId
                )
              );
            };

            if (ports.length > 0) {
              updatePortSpinner();

              await Promise.all(
                ports.map(async (port) => {
                  const portInfo = await session.ports.waitForPort(port, {
                    timeoutMs: 60000,
                  });

                  // eslint-disable-next-line no-constant-condition
                  while (true) {
                    const res = await fetch("https://" + portInfo.host);
                    if (res.status !== 502 && res.status !== 503) {
                      break;
                    }

                    await new Promise((resolve) => setTimeout(resolve, 1000));
                  }

                  updatePortSpinner();
                })
              );
            } else {
              spinner.start(
                updateSpinnerMessage(
                  index,
                  "No ports to open, waiting 5 seconds for tasks to run...",
                  sandboxId
                )
              );
              await new Promise((resolve) => setTimeout(resolve, 5000));
            }

            spinner.start(
              updateSpinnerMessage(
                index,
                "Creating memory snapshot...",
                sandboxId
              )
            );
            await sdk.sandboxes.hibernate(sandbox.id);
            spinner.start(
              updateSpinnerMessage(index, "Snapshot created", sandboxId)
            );

            return sandbox.id;
          } catch (error) {
            spinner.fail(
              updateSpinnerMessage(
                index,
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
                sandboxId
              )
            );
            throw error;
          }
        })
      );

      spinner.succeed(`\n${spinnerMessages.join("\n")}`);

      const data = handleResponse(
        await vmCreateTag({
          client: apiClient,
          body: {
            vm_ids: sandboxIds,
          },
        }),
        "Failed to create template"
      );
      console.log("Template created: " + data.tag_id);
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  },
};

type CreateSandboxParams = {
  apiClient: Client;
  shaTag: string;
  fromSandbox?: string;
  collectionPath?: string;
  name?: string;
  vmTier?: VMTier;
  ipcountry?: string;
};

async function createSandbox({
  apiClient,
  shaTag,
  collectionPath,
  fromSandbox,
  name,
}: CreateSandboxParams) {
  const sanitizedCollectionPath = collectionPath
    ? collectionPath.startsWith("/")
      ? collectionPath
      : `/${collectionPath}`
    : "/SDK-Templates";

  const sandbox = handleResponse(
    await sandboxFork({
      client: apiClient,
      path: {
        id: fromSandbox || getDefaultTemplateId(apiClient),
      },
      body: {
        title: name,
        privacy: 1,
        tags: ["sdk", shaTag],
        path: sanitizedCollectionPath,
      },
    }),
    "Failed to fork sandbox"
  );

  return sandbox.id;
}

async function getFiles(
  filePaths: string[],
  rootPath: string
): Promise<Record<string, { code: string }>> {
  if (filePaths.length > 30) {
    return {};
  }

  let hasBinaryFile = false;
  const files: Record<string, { code: string }> = {};
  await Promise.all(
    filePaths.map(async (filePath) => {
      const content = await fs.readFile(path.join(rootPath, filePath));

      if (await isBinaryFile(content)) {
        hasBinaryFile = true;
      }

      files[filePath] = { code: content.toString() };
    })
  );

  if (hasBinaryFile) {
    return {};
  }

  return files;
}
