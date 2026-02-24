import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface GitLabCredentials {
  token: string;
  baseUrl: string;
}

/**
 * Credentials are keyed by hostname, e.g.:
 * {
 *   "gitlab": {
 *     "gitlab.com":           { token: "...", baseUrl: "https://gitlab.com" },
 *     "gitlab.mycompany.com": { token: "...", baseUrl: "https://gitlab.mycompany.com" }
 *   }
 * }
 */
export interface Credentials {
  gitlab?: Record<string, GitLabCredentials>;
}

const CREDENTIALS_DIR = path.join(os.homedir(), '.ai-review');
const CREDENTIALS_FILE = path.join(CREDENTIALS_DIR, 'credentials.json');

export async function loadCredentials(): Promise<Credentials> {
  try {
    const content = await fs.readFile(CREDENTIALS_FILE, 'utf-8');
    return JSON.parse(content) as Credentials;
  } catch {
    return {};
  }
}

export async function saveCredentials(credentials: Credentials): Promise<void> {
  await fs.mkdir(CREDENTIALS_DIR, { recursive: true });
  await fs.writeFile(
    CREDENTIALS_FILE,
    JSON.stringify(credentials, null, 2),
    'utf-8',
  );
}

/**
 * Returns GitLab credentials for the specified hostname.
 * Throws if no credentials have been configured for that domain.
 */
export async function getGitLabCredentialsForDomain(
  domain: string,
): Promise<GitLabCredentials> {
  const credentials = await loadCredentials();
  const entry = credentials.gitlab?.[domain];
  if (!entry) {
    throw new Error(
      `No GitLab credentials configured for domain "${domain}". ` +
        `Run: ai-review configure gitlab`,
    );
  }
  return entry;
}
