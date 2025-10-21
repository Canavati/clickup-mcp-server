/**
 * SPDX-FileCopyrightText: © 2025 Talib Kareem <taazkareem@icloud.com>
 * SPDX-License-Identifier: MIT
 *
 * Configuration handling for ClickUp API credentials and application settings
 *
 * The required environment variables (CLICKUP_API_KEY and CLICKUP_TEAM_ID) are passed 
 * securely to this file when running the hosted server at smithery.ai. Optionally, 
 * they can be parsed via command line arguments when running the server locally.
 * 
 * The document support is optional and can be passed via command line arguments.
 * The default value is 'false' (string), which means document support will be disabled if
 * no parameter is passed. Pass it as 'true' (string) to enable it.
 * 
 * Tool filtering options:
 * - ENABLED_TOOLS: Comma-separated list of tools to enable (takes precedence over DISABLED_TOOLS)
 * - DISABLED_TOOLS: Comma-separated list of tools to disable (ignored if ENABLED_TOOLS is specified)
 *
 * Server transport options:
 * - ENABLE_SSE: Enable Server-Sent Events transport (default: false)
 * - SSE_PORT: Port for SSE server (default: 3000)
 * - ENABLE_STDIO: Enable STDIO transport (default: true)
 */

// Parse any command line environment arguments
const args = process.argv.slice(2);
const envArgs: { [key: string]: string } = {};
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--env' && i + 1 < args.length) {
    const [key, value] = args[i + 1].split('=');
    if (key === 'CLICKUP_API_KEY') envArgs.clickupApiKey = value;
    if (key === 'CLICKUP_TEAM_ID') envArgs.clickupTeamId = value;
    if (key === 'DOCUMENT_SUPPORT') envArgs.documentSupport = value;
    if (key === 'LOG_LEVEL') envArgs.logLevel = value;
    if (key === 'DISABLED_TOOLS') envArgs.disabledTools = value;
    if (key === 'ENABLED_TOOLS') envArgs.enabledTools = value;
    if (key === 'ENABLE_SSE') envArgs.enableSSE = value;
    if (key === 'SSE_PORT') envArgs.ssePort = value;
    if (key === 'ENABLE_STDIO') envArgs.enableStdio = value;
    if (key === 'PORT') envArgs.port = value;
    i++;
  }
}

// Log levels enum
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
}

// Parse LOG_LEVEL string to LogLevel enum
const parseLogLevel = (levelStr: string | undefined): LogLevel => {
  if (!levelStr) return LogLevel.ERROR; // Default to ERROR if not specified
  
  switch (levelStr.toUpperCase()) {
    case 'TRACE': return LogLevel.TRACE;
    case 'DEBUG': return LogLevel.DEBUG;
    case 'INFO': return LogLevel.INFO;
    case 'WARN': return LogLevel.WARN;
    case 'ERROR': return LogLevel.ERROR;
    default:
      // Don't use console.error as it interferes with JSON-RPC communication
      return LogLevel.ERROR;
  }
};

// Define required configuration interface
interface Config {
  clickupApiKey: string;
  clickupTeamId: string;
  enableSponsorMessage: boolean;
  documentSupport: string;
  logLevel: LogLevel;
  disabledTools: string[];
  enabledTools: string[];
  enableSSE: boolean;
  ssePort: number;
  enableStdio: boolean;
  port?: string;
  // Security configuration (opt-in for backwards compatibility)
  enableSecurityFeatures: boolean;
  enableOriginValidation: boolean;
  enableRateLimit: boolean;
  enableCors: boolean;
  allowedOrigins: string[];
  rateLimitMax: number;
  rateLimitWindowMs: number;
  maxRequestSize: string;
  // HTTPS configuration
  enableHttps: boolean;
  httpsPort?: string;
  sslKeyPath?: string;
  sslCertPath?: string;
  sslCaPath?: string;
}

// Parse boolean string
const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

// Parse integer string
const parseInteger = (value: string | undefined, defaultValue: number): number => {
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Parse comma-separated origins list
const parseOrigins = (value: string | undefined, defaultValue: string[]): string[] => {
  if (!value) return defaultValue;
  return value.split(',').map(origin => origin.trim()).filter(origin => origin !== '');
};

// Load configuration from command line args or environment variables
// Smithery passes config as camelCase env vars (clickupApiKey), but also support UPPER_SNAKE_CASE
//
// Configuration object uses getters to read process.env dynamically on every access
// This allows Smithery HTTP transport to set process.env during requests and have
// the config values update immediately (fixes issue where static config was created once at startup)
const configuration: Config = {
  get clickupApiKey() {
    return envArgs.clickupApiKey || process.env.CLICKUP_API_KEY || process.env.clickupApiKey || '';
  },
  get clickupTeamId() {
    return envArgs.clickupTeamId || process.env.CLICKUP_TEAM_ID || process.env.clickupTeamId || '';
  },
  get enableSponsorMessage() {
    return process.env.ENABLE_SPONSOR_MESSAGE !== 'false';
  },
  get documentSupport() {
    return envArgs.documentSupport || process.env.DOCUMENT_SUPPORT || process.env.DOCUMENT_MODULE || process.env.DOCUMENT_MODEL || 'false';
  },
  get logLevel() {
    return parseLogLevel(envArgs.logLevel || process.env.LOG_LEVEL);
  },
  get disabledTools() {
    return (envArgs.disabledTools || process.env.DISABLED_TOOLS || process.env.DISABLED_COMMANDS)?.split(',').map(cmd => cmd.trim()).filter(cmd => cmd !== '') || [];
  },
  get enabledTools() {
    return (envArgs.enabledTools || process.env.ENABLED_TOOLS)?.split(',').map(cmd => cmd.trim()).filter(cmd => cmd !== '') || [];
  },
  get enableSSE() {
    return parseBoolean(envArgs.enableSSE || process.env.ENABLE_SSE, false);
  },
  get ssePort() {
    return parseInteger(envArgs.ssePort || process.env.SSE_PORT, 3000);
  },
  get enableStdio() {
    return parseBoolean(envArgs.enableStdio || process.env.ENABLE_STDIO, true);
  },
  get port() {
    return envArgs.port || process.env.PORT || '3231';
  },
  // Security configuration (opt-in for backwards compatibility)
  get enableSecurityFeatures() {
    return parseBoolean(process.env.ENABLE_SECURITY_FEATURES, false);
  },
  get enableOriginValidation() {
    return parseBoolean(process.env.ENABLE_ORIGIN_VALIDATION, false);
  },
  get enableRateLimit() {
    return parseBoolean(process.env.ENABLE_RATE_LIMIT, false);
  },
  get enableCors() {
    return parseBoolean(process.env.ENABLE_CORS, false);
  },
  get allowedOrigins() {
    return parseOrigins(process.env.ALLOWED_ORIGINS, [
      'http://127.0.0.1:3231',
      'http://localhost:3231',
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'https://127.0.0.1:3443',
      'https://localhost:3443',
      'https://127.0.0.1:3231',
      'https://localhost:3231'
    ]);
  },
  get rateLimitMax() {
    return parseInteger(process.env.RATE_LIMIT_MAX, 100);
  },
  get rateLimitWindowMs() {
    return parseInteger(process.env.RATE_LIMIT_WINDOW_MS, 60000);
  },
  get maxRequestSize() {
    return process.env.MAX_REQUEST_SIZE || '10mb';
  },
  // HTTPS configuration
  get enableHttps() {
    return parseBoolean(process.env.ENABLE_HTTPS, false);
  },
  get httpsPort() {
    return process.env.HTTPS_PORT || '3443';
  },
  get sslKeyPath() {
    return process.env.SSL_KEY_PATH;
  },
  get sslCertPath() {
    return process.env.SSL_CERT_PATH;
  },
  get sslCaPath() {
    return process.env.SSL_CA_PATH;
  },
};

// Don't log to console as it interferes with JSON-RPC communication

// Allow credentials to be optional to support Smithery scanner inspection
// The scanner needs to list tools without credentials present
// When tools are actually called without credentials, the ClickUp API will return 401/403 errors
// which will be handled gracefully by the service layer
//
// Previous validation (now disabled to support Smithery scanner):
// const requiredVars = ['clickupApiKey', 'clickupTeamId'];
// const missingEnvVars = requiredVars
//   .filter(key => !configuration[key as keyof Config])
//   .map(key => key);
//
// if (missingEnvVars.length > 0) {
//   throw new Error(
//     `Missing required environment variables: ${missingEnvVars.join(', ')}`
//   );
// }

export default configuration;
