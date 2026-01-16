import { JSONObject } from '@dynatrace/openkit-js';

export interface ManagedEnvironmentConfig {
  environmentId: string;
  apiUrl: string;
  dashboardUrl: string;
  apiToken: string;
  alias: string;
  httpProxy?: string;
  httpsProxy?: string;
}

export function parseManagedEnvironmentConfig(environmentInfo: JSONObject): ManagedEnvironmentConfig {
  const environmentIdRaw = environmentInfo.environmentId.toString();
  const apiUrlRaw = environmentInfo.apiEndpointUrl.toString();
  const dashboardUrlRaw = environmentInfo.dynatraceUrl.toString();
  const apiToken = environmentInfo.apiToken.toString();
  const alias = environmentInfo.alias.toString();
  const httpProxy = environmentInfo.httpProxyUrl?.toString();
  const httpsProxy = environmentInfo.httspProxyUrl?.toString();

  if (!environmentIdRaw) {
    throw new Error('environmentId is required');
  }

  if (!apiUrlRaw) {
    throw new Error('apiEndpointUrl is required');
  }

  if (!apiToken) {
    throw new Error('apiToken is required');
  }

  if (!alias) {
    throw new Error('`alias` is required');
  }

  let environmentId = environmentIdRaw.replace(/\/$/, ''); // Remove trailing slash
  let apiUrl = apiUrlRaw + (apiUrlRaw.endsWith('/') ? '' : '/') + 'e/' + environmentId;
  let dashboardUrl = dashboardUrlRaw ? dashboardUrlRaw : apiUrlRaw;
  dashboardUrl = dashboardUrl + (dashboardUrl.endsWith('/') ? '' : '/') + 'e/' + environmentId;

  return {
    environmentId: environmentId,
    apiUrl: apiUrl,
    dashboardUrl: dashboardUrl,
    apiToken: apiToken,
    alias: alias,
    httpProxy: httpProxy,
    httpsProxy: httpsProxy
  };
}


export function getManagedEnvironmentConfigs(): ManagedEnvironmentConfig[] {
  const environmentConfigs = process.env.DT_ENVIRONMENT_CONFIGS;
  if (!environmentConfigs) {
    throw new Error('DT_ENVIRONMENT_CONFIGS is required');
  }
  let parsedConfig;
  console.log('we in');
  try {
    parsedConfig = JSON.parse(environmentConfigs);
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error(`JSON syntax error: ${e}`);
    } else {
      throw e;
    }
  }

  let validConfigurations = []
  for (let env of parsedConfig) {
    validConfigurations.push(
      parseManagedEnvironmentConfig(env)
    )
  }

  return validConfigurations;
}
