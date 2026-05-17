export function requireEnv(name: string): string {
  // eslint-disable-next-line security/detect-object-injection
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`${name} environment variable is required but not set. Check your .env file.`);
  }
  return value.trim();
}

export function requireEnvOrDefault(name: string, defaultValue: string): string {
  // eslint-disable-next-line security/detect-object-injection
  const value = process.env[name];
  if (!value || value.trim() === '') {
    return defaultValue;
  }
  return value.trim();
}
