import { PitcherManagerResponse } from "@codesandbox/pitcher-client";
import { VMTier } from "./VMTier";
import type { WebSocketSession } from "./sessions/WebSocketSession";
import { HostToken } from "./Hosts";

export interface SystemMetricsStatus {
  cpu: {
    cores: number;
    used: number;
    configured: number;
  };
  memory: {
    usedKiB: number;
    totalKiB: number;
    configuredKiB: number;
  };
  storage: {
    usedKB: number;
    totalKB: number;
    configuredKB: number;
  };
}

export type SandboxPrivacy = "public" | "unlisted" | "private";

export type SandboxInfo = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title?: string;
  description?: string;
  privacy: SandboxPrivacy;
  tags: string[];
};

export type SandboxListOpts = {
  tags?: string[];
  orderBy?: "inserted_at" | "updated_at";
  direction?: "asc" | "desc";
  status?: "running";
};

export interface SandboxListResponse {
  sandboxes: SandboxInfo[];
  hasMore: boolean;
  totalCount: number;
  pagination: {
    currentPage: number;
    nextPage: number | null;
    pageSize: number;
  };
}

export type PaginationOpts = {
  page?: number;
  pageSize?: number;
};

export interface ClientOpts {
  baseUrl?: string;
  /**
   * Custom fetch implementation
   *
   * @default fetch
   */
  fetch?: typeof fetch;

  /**
   * Additional headers to send with each request
   */
  headers?: Record<string, string>;
}

export const DEFAULT_SUBSCRIPTIONS = {
  client: {
    status: true,
  },
  file: {
    status: true,
    selection: true,
    ot: true,
  },
  fs: {
    operations: true,
  },
  git: {
    status: true,
    operations: true,
  },
  port: {
    status: true,
  },
  setup: {
    progress: true,
  },
  shell: {
    status: true,
  },
  system: {
    metrics: true,
  },
};

export interface StartSandboxOpts {
  /**
   * Country, served as a hint on where you want the sandbox to be scheduled. For example, if "NL" is given
   * as a country, the sandbox will be scheduled in a cluster inside Europe. Note that this is not a guarantee,
   * and the sandbox might end up in a different region based on availability and scheduling decisions.
   *
   * Follows ISO 3166-1 alpha-2 codes.
   */
  ipcountry?: string;

  /**
   * Determines which specs to start the VM with. If not specified, the VM will start with the default specs for the workspace.
   * Check {@link VMTier} for available tiers.
   *
   * You can only specify a VM tier when starting a VM that is inside your workspace.
   * Specifying a VM tier for someone else's sandbox will return an error.
   */
  vmTier?: VMTier;

  /**
   * The amount of seconds to wait before hibernating the sandbox after inactivity.
   *
   * Defaults to 300 seconds for free users, 1800 seconds for pro users. Maximum is 86400 seconds (1 day).
   */
  hibernationTimeoutSeconds?: number;

  /**
   * Configuration for when the VM should automatically wake up from hibernation.
   */
  automaticWakeupConfig?: {
    /**
     * Whether the VM should automatically wake up on HTTP requests to hosts exposed (excludes WebSocket requests)
     *
     * @default true
     */
    http: boolean;

    /**
     * Whether the VM should automatically wake up on WebSocket connections to host exposed
     *
     * @default false
     */
    websocket: boolean;
  };
}

export type CreateSandboxBaseOpts = {
  /**
   * What the privacy of the new sandbox should be. Defaults to "public".
   */
  privacy?: SandboxPrivacy;

  /**
   * The title of the new sandbox.
   */
  title?: string;

  /**
   * The description of the new sandbox.
   */
  description?: string;

  /**
   * Which tags to add to the sandbox, can be used for categorization and filtering. Max 10 tags.
   */
  tags?: string[];

  /**
   * In which folder to put the sandbox in (inside your workspace).
   */
  path?: string;
};

export type SandboxSessionData = {
  id: string;
  pitcher_token: string;
  pitcher_url: string;
  user_workspace_path: string;
};

export interface SessionCreateOptions {
  id: string;
  permission?: "read" | "write";
  git?: {
    accessToken?: string;
    email: string;
    name?: string;
  };
  env?: Record<string, string>;
  hostToken?: HostToken;
}

export type SandboxSession = {
  sandboxId: string;
  pitcherToken: string;
  pitcherUrl: string;
  userWorkspacePath: string;
  env?: Record<string, string>;
};

export type CreateSandboxTemplateSourceOpts = CreateSandboxBaseOpts & {
  source: "template";
  /**
   * What template to fork from, this is the id of another sandbox. Defaults to our
   * [universal template](https://codesandbox.io/s/github/codesandbox/sandbox-templates/tree/main/universal).
   */
  id?: string;
};

export type CreateSandboxGitSourceOpts = CreateSandboxBaseOpts & {
  source: "git";
  url: string;
  branch: string;
  templateId?: string;
  config?: {
    accessToken: string;
    email: string;
    name?: string;
  };
  setup?: (session: WebSocketSession) => Promise<void>;
};

export type CreateSandboxOpts =
  | CreateSandboxTemplateSourceOpts
  | CreateSandboxGitSourceOpts;

export type SandboxOpts = {
  id: string;
  bootupType: PitcherManagerResponse["bootupType"];
  cluster: string;
  isUpToDate: boolean;
  globalSession: SandboxSession;
};

export type SandboxBrowserSession = PitcherManagerResponse & {
  id: string;
  sessionId?: string;
  env?: Record<string, string>;
  hostToken?: HostToken;
};
