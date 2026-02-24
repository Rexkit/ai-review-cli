const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  py: 'python',
  rb: 'ruby',
  go: 'go',
  java: 'java',
  kt: 'kotlin',
  kts: 'kotlin',
  swift: 'swift',
  cs: 'csharp',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  c: 'c',
  h: 'c',
  hpp: 'cpp',
  rs: 'rust',
  php: 'php',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  yaml: 'yaml',
  yml: 'yaml',
  json: 'json',
  md: 'markdown',
  mdx: 'markdown',
  sql: 'sql',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'scss',
  sass: 'sass',
  tf: 'terraform',
  hcl: 'hcl',
  toml: 'toml',
  xml: 'xml',
  vue: 'vue',
  svelte: 'svelte',
  ex: 'elixir',
  exs: 'elixir',
  erl: 'erlang',
  hs: 'haskell',
  lua: 'lua',
  r: 'r',
  dart: 'dart',
};

/**
 * Detects the programming language from a file path based on its extension
 * or special filename.
 */
export function detectLanguage(filePath: string): string | undefined {
  if (!filePath) return undefined;

  const fileName = filePath.split('/').pop()?.toLowerCase() ?? '';

  // Handle exact filename matches
  if (fileName === 'dockerfile') return 'dockerfile';
  if (fileName === 'makefile') return 'makefile';
  if (fileName === '.gitignore') return 'gitignore';
  if (fileName === '.env' || fileName.startsWith('.env.')) return 'dotenv';

  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex === -1) return undefined;

  const ext = fileName.slice(dotIndex + 1);
  return EXTENSION_TO_LANGUAGE[ext];
}
