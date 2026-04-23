import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

export interface Settings {
  /**
   * Human language that AI agents should use for MR review descriptions and comments.
   * Examples: "English", "Russian", "ru", "Русский".
   */
  reviewLanguage: string;
}

export const DEFAULT_SETTINGS: Settings = {
  reviewLanguage: 'English',
};

const SETTINGS_DIR = path.join(os.homedir(), '.ai-review');
const SETTINGS_PATH = path.join(SETTINGS_DIR, 'settings.json');

function normalizeSettings(value: unknown): Settings {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_SETTINGS };
  }

  const raw = value as Partial<Record<keyof Settings, unknown>>;
  const reviewLanguage =
    typeof raw.reviewLanguage === 'string' && raw.reviewLanguage.trim()
      ? raw.reviewLanguage.trim()
      : DEFAULT_SETTINGS.reviewLanguage;

  return { reviewLanguage };
}

export async function loadSettings(): Promise<Settings> {
  try {
    const content = await fs.readFile(SETTINGS_PATH, 'utf-8');
    return normalizeSettings(JSON.parse(content));
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      return { ...DEFAULT_SETTINGS };
    }

    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in ${SETTINGS_PATH}: ${error.message}`);
    }

    throw error;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await fs.mkdir(SETTINGS_DIR, { recursive: true });
  const normalized = normalizeSettings(settings);
  await fs.writeFile(
    SETTINGS_PATH,
    JSON.stringify(normalized, null, 2),
    'utf-8',
  );
}

export function getSettingsPath(): string {
  return SETTINGS_PATH;
}
