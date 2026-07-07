// Record<string, T> maps string keys to values of type T.
// Here it provides type-safe access to environment-driven configuration.
type AppConfig = Readonly<{
  port: number;
  env: string;
  appName: string;
}>;

// Every value comes from an environment variable with a sensible default.
// This follows the 12-Factor App principle: "Store config in the environment."
// The same compiled code runs in development, staging, and production —
// only the environment variables change.
const config: AppConfig = {
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'Mini Zepto Backend',
} as const;

export default config;
