import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface GitLabCredentials {
  token: string;
  baseUrl: string;
}

export interface Credentials {
  gitlab?: GitLabCredentials;
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

export async function getGitLabCredentials(): Promise<GitLabCredentials> {
  const credentials = await loadCredentials();
  if (!credentials.gitlab) {
    throw new Error(
      'GitLab credentials not configured. Run: ai-review configure gitlab',
    );
  }
  return credentials.gitlab;
}
