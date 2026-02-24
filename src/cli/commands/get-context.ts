import { Command } from 'commander';
import { getGitLabCredentials } from '../../utils/credentials';
import { GitLabProvider } from '../../providers/gitlab/gitlab-provider';
import { MRContextBuilder } from '../../context/mr-context-builder';

interface GetContextOptions {
  projectId: string;
}

export function registerGetContextCommand(program: Command): void {
  program
    .command('get-context <mr-id>')
    .description('Fetch MR context from the Git provider and output JSON')
    .requiredOption(
      '--project-id <projectId>',
      'Project ID or URL-encoded path (e.g. 123 or group/repo)',
    )
    .action(async (mrId: string, options: GetContextOptions) => {
      try {
        const credentials = await getGitLabCredentials();
        const provider = new GitLabProvider(
          credentials.baseUrl,
          credentials.token,
        );
        const builder = new MRContextBuilder(provider);

        const context = await builder.build(options.projectId, mrId);

        console.log(JSON.stringify(context, null, 2));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        console.error(
          JSON.stringify({ error: 'FETCH_FAILED', message }),
        );
        process.exit(1);
      }
    });
}
