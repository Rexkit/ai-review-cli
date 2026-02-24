import { Command } from 'commander';
import * as readline from 'readline';
import { loadCredentials, saveCredentials } from '../../utils/credentials';

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export function registerConfigureCommand(program: Command): void {
  const configure = program
    .command('configure')
    .description('Configure provider credentials');

  configure
    .command('gitlab')
    .description('Configure GitLab credentials (stored at ~/.ai-review/credentials.json)')
    .action(async () => {
      try {
        const credentials = await loadCredentials();

        const token = await prompt('Enter GitLab Personal Access Token: ');
        if (!token) {
          console.error(
            JSON.stringify({
              error: 'INVALID_INPUT',
              message: 'Token cannot be empty.',
            }),
          );
          process.exit(1);
        }

        const baseUrlInput = await prompt(
          'Enter GitLab base URL [https://gitlab.com]: ',
        );
        const baseUrl = baseUrlInput || 'https://gitlab.com';

        credentials.gitlab = { token, baseUrl };
        await saveCredentials(credentials);

        console.log('\nConfiguration saved to ~/.ai-review/credentials.json');
        console.log(`  Base URL : ${baseUrl}`);
        console.log(`  Token    : ${token.slice(0, 8)}...`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        console.error(
          JSON.stringify({ error: 'CONFIGURE_FAILED', message }),
        );
        process.exit(1);
      }
    });
}
