
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```sh
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const NF_PROJECT_ID: string;
	export const KUBERNETES_SERVICE_PORT: string;
	export const KUBERNETES_PORT: string;
	export const npm_config_user_agent: string;
	export const SUPERVISOR_GROUP_NAME: string;
	export const NF_RESOURCE_ID: string;
	export const NF_DISCOVERY_SERVICE: string;
	export const HOSTNAME: string;
	export const NF_POD_ID: string;
	export const BUN_INSTALL: string;
	export const npm_node_execpath: string;
	export const NF_HOSTS_CUSTOM: string;
	export const SHLVL: string;
	export const LD_LIBRARY_PATH: string;
	export const npm_config_noproxy: string;
	export const HOME: string;
	export const NF_EXTERNAL_DOCKER_IMAGE: string;
	export const OLDPWD: string;
	export const PYTHON: string;
	export const NF_OBJECT_TYPE: string;
	export const NVM_BIN: string;
	export const npm_package_json: string;
	export const NVM_INC: string;
	export const NF_EPHEMERAL_STORAGE: string;
	export const LC_CTYPE: string;
	export const npm_config_userconfig: string;
	export const npm_config_local_prefix: string;
	export const COLOR: string;
	export const NF_RAM_RESOURCES: string;
	export const NVM_DIR: string;
	export const NF_POD_IP: string;
	export const _: string;
	export const npm_config_prefix: string;
	export const npm_config_npm_version: string;
	export const PKG_CONFIG_PATH: string;
	export const TERM: string;
	export const npm_config_cache: string;
	export const KUBERNETES_PORT_443_TCP_ADDR: string;
	export const NF_HOSTS: string;
	export const npm_config_node_gyp: string;
	export const PATH: string;
	export const NF_OBJECT_ID: string;
	export const NF_CPU_RESOURCES: string;
	export const NODE: string;
	export const npm_package_name: string;
	export const KUBERNETES_PORT_443_TCP_PORT: string;
	export const KUBERNETES_PORT_443_TCP_PROTO: string;
	export const SUPERVISOR_ENABLED: string;
	export const npm_lifecycle_script: string;
	export const DEBIAN_FRONTEND: string;
	export const SHELL: string;
	export const npm_package_version: string;
	export const npm_lifecycle_event: string;
	export const KUBERNETES_SERVICE_PORT_HTTPS: string;
	export const SUPERVISOR_SERVER_URL: string;
	export const KUBERNETES_PORT_443_TCP: string;
	export const NF_REGION: string;
	export const SUPERVISOR_PROCESS_NAME: string;
	export const npm_config_globalconfig: string;
	export const npm_config_init_module: string;
	export const PWD: string;
	export const KUBERNETES_SERVICE_HOST: string;
	export const npm_execpath: string;
	export const NF_EXTERNAL_DOCKER_PRIVATE: string;
	export const NVM_CD_FLAGS: string;
	export const npm_config_global_prefix: string;
	export const NF_POD_NAME: string;
	export const OMP_NUM_THREADS: string;
	export const npm_command: string;
	export const NF_EXTERNAL_DOCKER_PROVIDER: string;
	export const npm_config_python: string;
	export const NF_PLAN_ID: string;
	export const NF_NAMESPACE: string;
	export const INIT_CWD: string;
	export const EDITOR: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		NF_PROJECT_ID: string;
		KUBERNETES_SERVICE_PORT: string;
		KUBERNETES_PORT: string;
		npm_config_user_agent: string;
		SUPERVISOR_GROUP_NAME: string;
		NF_RESOURCE_ID: string;
		NF_DISCOVERY_SERVICE: string;
		HOSTNAME: string;
		NF_POD_ID: string;
		BUN_INSTALL: string;
		npm_node_execpath: string;
		NF_HOSTS_CUSTOM: string;
		SHLVL: string;
		LD_LIBRARY_PATH: string;
		npm_config_noproxy: string;
		HOME: string;
		NF_EXTERNAL_DOCKER_IMAGE: string;
		OLDPWD: string;
		PYTHON: string;
		NF_OBJECT_TYPE: string;
		NVM_BIN: string;
		npm_package_json: string;
		NVM_INC: string;
		NF_EPHEMERAL_STORAGE: string;
		LC_CTYPE: string;
		npm_config_userconfig: string;
		npm_config_local_prefix: string;
		COLOR: string;
		NF_RAM_RESOURCES: string;
		NVM_DIR: string;
		NF_POD_IP: string;
		_: string;
		npm_config_prefix: string;
		npm_config_npm_version: string;
		PKG_CONFIG_PATH: string;
		TERM: string;
		npm_config_cache: string;
		KUBERNETES_PORT_443_TCP_ADDR: string;
		NF_HOSTS: string;
		npm_config_node_gyp: string;
		PATH: string;
		NF_OBJECT_ID: string;
		NF_CPU_RESOURCES: string;
		NODE: string;
		npm_package_name: string;
		KUBERNETES_PORT_443_TCP_PORT: string;
		KUBERNETES_PORT_443_TCP_PROTO: string;
		SUPERVISOR_ENABLED: string;
		npm_lifecycle_script: string;
		DEBIAN_FRONTEND: string;
		SHELL: string;
		npm_package_version: string;
		npm_lifecycle_event: string;
		KUBERNETES_SERVICE_PORT_HTTPS: string;
		SUPERVISOR_SERVER_URL: string;
		KUBERNETES_PORT_443_TCP: string;
		NF_REGION: string;
		SUPERVISOR_PROCESS_NAME: string;
		npm_config_globalconfig: string;
		npm_config_init_module: string;
		PWD: string;
		KUBERNETES_SERVICE_HOST: string;
		npm_execpath: string;
		NF_EXTERNAL_DOCKER_PRIVATE: string;
		NVM_CD_FLAGS: string;
		npm_config_global_prefix: string;
		NF_POD_NAME: string;
		OMP_NUM_THREADS: string;
		npm_command: string;
		NF_EXTERNAL_DOCKER_PROVIDER: string;
		npm_config_python: string;
		NF_PLAN_ID: string;
		NF_NAMESPACE: string;
		INIT_CWD: string;
		EDITOR: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
