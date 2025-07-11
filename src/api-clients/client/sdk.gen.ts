// This file is auto-generated by @hey-api/openapi-ts

import type { Options as ClientOptions, TDataShape, Client } from '@hey-api/client-fetch';
import type { MetaInfoData, MetaInfoResponse, WorkspaceCreateData, WorkspaceCreateResponse2, TokenCreateData, TokenCreateResponse2, TokenUpdateData, TokenUpdateResponse2, SandboxListData, SandboxListResponse2, SandboxCreateData, SandboxCreateResponse2, SandboxGetData, SandboxGetResponse2, SandboxForkData, SandboxForkResponse2, PreviewTokenRevokeAllData, PreviewTokenRevokeAllResponse2, PreviewTokenListData, PreviewTokenListResponse2, PreviewTokenCreateData, PreviewTokenCreateResponse2, PreviewTokenUpdateData, PreviewTokenUpdateResponse2, VmListClustersData, VmListClustersResponse2, VmCreateTagData, VmCreateTagResponse2, VmHibernateData, VmHibernateResponse2, VmUpdateHibernationTimeoutData, VmUpdateHibernationTimeoutResponse2, VmCreateSessionData, VmCreateSessionResponse2, VmShutdownData, VmShutdownResponse2, VmUpdateSpecsData, VmUpdateSpecsResponse2, VmStartData, VmStartResponse2, VmUpdateSpecs2Data, VmUpdateSpecs2Response, PreviewHostListData, PreviewHostListResponse2, PreviewHostCreateData, PreviewHostCreateResponse, PreviewHostUpdateData, PreviewHostUpdateResponse } from './types.gen';
import { client as _heyApiClient } from './client.gen';

export type Options<TData extends TDataShape = TDataShape, ThrowOnError extends boolean = boolean> = ClientOptions<TData, ThrowOnError> & {
    /**
     * You can provide a client instance returned by `createClient()` instead of
     * individual options. This might be also useful if you want to implement a
     * custom client.
     */
    client?: Client;
};

/**
 * Metadata about the API
 */
export const metaInfo = <ThrowOnError extends boolean = false>(options?: Options<MetaInfoData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<MetaInfoResponse, unknown, ThrowOnError>({
        url: '/meta/info',
        ...options
    });
};

/**
 * Create a Workspace
 * Create a new, empty, workspace in the current organization
 *
 */
export const workspaceCreate = <ThrowOnError extends boolean = false>(options?: Options<WorkspaceCreateData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).post<WorkspaceCreateResponse2, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/org/workspace',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Create an API Token
 * Create a new API token for a workspace that is part of the current organization.
 *
 */
export const tokenCreate = <ThrowOnError extends boolean = false>(options: Options<TokenCreateData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<TokenCreateResponse2, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/org/workspace/{team_id}/tokens',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Update an API Token
 * Update an API token for a workspace that is part of the current organization.
 *
 */
export const tokenUpdate = <ThrowOnError extends boolean = false>(options: Options<TokenUpdateData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).patch<TokenUpdateResponse2, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/org/workspace/{team_id}/tokens/{token_id}',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * List Sandboxes
 * List sandboxes from the current workspace with optional filters.
 * Results are limited to a maximum of 50 sandboxes per request.
 *
 */
export const sandboxList = <ThrowOnError extends boolean = false>(options?: Options<SandboxListData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<SandboxListResponse2, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/sandbox',
        ...options
    });
};

/**
 * Create a Sandbox
 * Create a new sandbox in the current workspace with file contents
 *
 */
export const sandboxCreate = <ThrowOnError extends boolean = false>(options?: Options<SandboxCreateData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).post<SandboxCreateResponse2, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/sandbox',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Get a Sandbox
 * Retrieve a sandbox by its ID
 *
 */
export const sandboxGet = <ThrowOnError extends boolean = false>(options: Options<SandboxGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<SandboxGetResponse2, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/sandbox/{id}',
        ...options
    });
};

/**
 * Fork a Sandbox
 * Fork an existing sandbox to the current workspace
 *
 */
export const sandboxFork = <ThrowOnError extends boolean = false>(options: Options<SandboxForkData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<SandboxForkResponse2, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/sandbox/{id}/fork',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Revoke preview tokens
 * Immediately expires all active preview tokens associated with this sandbox
 *
 */
export const previewTokenRevokeAll = <ThrowOnError extends boolean = false>(options: Options<PreviewTokenRevokeAllData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).delete<PreviewTokenRevokeAllResponse2, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/sandbox/{id}/tokens',
        ...options
    });
};

/**
 * List Preview Tokens
 * List information about the preview tokens associated with the current sandbox
 *
 */
export const previewTokenList = <ThrowOnError extends boolean = false>(options: Options<PreviewTokenListData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<PreviewTokenListResponse2, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/sandbox/{id}/tokens',
        ...options
    });
};

/**
 * Create a Preview Token
 * Create a new Preview token that allow access to a private sandbox
 *
 */
export const previewTokenCreate = <ThrowOnError extends boolean = false>(options: Options<PreviewTokenCreateData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<PreviewTokenCreateResponse2, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/sandbox/{id}/tokens',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Update a Preview Token
 * Update a Preview token that allow access to a private sandbox
 *
 */
export const previewTokenUpdate = <ThrowOnError extends boolean = false>(options: Options<PreviewTokenUpdateData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).patch<PreviewTokenUpdateResponse2, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/sandbox/{id}/tokens/{token_id}',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * List all available clusters
 * List all available clusters.
 *
 */
export const vmListClusters = <ThrowOnError extends boolean = false>(options?: Options<VmListClustersData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<VmListClustersResponse2, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/vm/clusters',
        ...options
    });
};

/**
 * Create a new tag for a VM
 * Creates a new tag for a VM.
 *
 */
export const vmCreateTag = <ThrowOnError extends boolean = false>(options?: Options<VmCreateTagData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).post<VmCreateTagResponse2, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/vm/tag',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Hibernate a VM
 * Suspends a running VM, saving a snapshot of its memory and running processes
 *
 * This endpoint may take an extended amount of time to return (30 seconds). If the VM is not
 * currently running, it will return an error (404).
 *
 * Unless later shut down by request or due to inactivity, a hibernated VM can be resumed with
 * minimal latency.
 *
 */
export const vmHibernate = <ThrowOnError extends boolean = false>(options: Options<VmHibernateData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<VmHibernateResponse2, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/vm/{id}/hibernate',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Update VM Hibernation Timeout
 * Updates the hibernation timeout of a running VM.
 *
 * This endpoint can only be used on VMs that belong to your team's workspace.
 * The new timeout must be greater than 0 and less than or equal to 86400 seconds (24 hours).
 *
 */
export const vmUpdateHibernationTimeout = <ThrowOnError extends boolean = false>(options: Options<VmUpdateHibernationTimeoutData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).put<VmUpdateHibernationTimeoutResponse2, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/vm/{id}/hibernation_timeout',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Create a new session on a VM
 * Creates a new session on a running VM. A session represents an isolated Linux user, with their own container.
 * A session has a single use token that the user can use to connect to the VM. This token has specific permissions (currently, read or write).
 * The session is identified by a unique session ID, and the Linux username is based on the session ID.
 *
 * The Git user name and email can be configured via parameters.
 *
 * This endpoint requires the VM to be running. If the VM is not running, it will return a 404 error.
 *
 */
export const vmCreateSession = <ThrowOnError extends boolean = false>(options: Options<VmCreateSessionData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<VmCreateSessionResponse2, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/vm/{id}/sessions',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Shutdown a VM
 * Stops a running VM, ending all currently running processes
 *
 * This endpoint may take an extended amount of time to return (30 seconds). If the VM is not
 * currently running, it will return an error (404).
 *
 * Shutdown VMs require additional time to start up.
 *
 */
export const vmShutdown = <ThrowOnError extends boolean = false>(options: Options<VmShutdownData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<VmShutdownResponse2, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/vm/{id}/shutdown',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Update VM Specs
 * Updates the specifications (CPU, memory, storage) of a running VM.
 *
 * This endpoint can only be used on VMs that belong to your team's workspace.
 * The new tier must not exceed your team's maximum allowed tier.
 *
 */
export const vmUpdateSpecs = <ThrowOnError extends boolean = false>(options: Options<VmUpdateSpecsData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).put<VmUpdateSpecsResponse2, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/vm/{id}/specs',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Start a VM
 * Start a virtual machine for the sandbox (devbox) with the given ID
 *
 * While the `sandbox:read` scope is required for this endpoint, the resulting VM will have
 * permissions according to the `sandbox:edit_code` scope. If present, the returned token will
 * have write permissions to the contents of the VM. Otherwise, the returned token will grant
 * only read-only permissions.
 *
 * This endpoint is subject to special rate limits related to concurrent VM usage.
 *
 */
export const vmStart = <ThrowOnError extends boolean = false>(options: Options<VmStartData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<VmStartResponse2, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/vm/{id}/start',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Update VM Specs
 * Updates the specifications (CPU, memory, storage) of a running VM.
 *
 * This endpoint can only be used on VMs that belong to your team's workspace.
 * The new tier must not exceed your team's maximum allowed tier.
 *
 */
export const vmUpdateSpecs2 = <ThrowOnError extends boolean = false>(options: Options<VmUpdateSpecs2Data, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<VmUpdateSpecs2Response, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/vm/{id}/update_specs',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * List Preview Hosts
 * List all trusted preview hosts for the current team
 *
 */
export const previewHostList = <ThrowOnError extends boolean = false>(options?: Options<PreviewHostListData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<PreviewHostListResponse2, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/workspace/preview_hosts',
        ...options
    });
};

/**
 * Create Preview Hosts
 * Add one or more trusted domains that are allowed to access sandbox previews for this workspace.
 *
 */
export const previewHostCreate = <ThrowOnError extends boolean = false>(options?: Options<PreviewHostCreateData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).post<PreviewHostCreateResponse, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/workspace/preview_hosts',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Update Preview Hosts
 * Replace the list of trusted domains that are allowed to access sandbox previews for this workspace.
 *
 */
export const previewHostUpdate = <ThrowOnError extends boolean = false>(options?: Options<PreviewHostUpdateData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).put<PreviewHostUpdateResponse, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/workspace/preview_hosts',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};