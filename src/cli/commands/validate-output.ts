import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import { ReviewSchema } from '../../schema/review-output.schema';

export function registerValidateOutputCommand(program: Command): void {
  program
    .command('validate-output <file>')
    .description(
      'Validate an AI-generated review JSON file against the review output schema.\n' +
        'Example: ai-review validate-output review.json',
    )
    .action((file: string) => {
      const filePath = path.resolve(file);

      let raw: string;
      try {
        raw = fs.readFileSync(filePath, 'utf-8');
      } catch {
        console.error(
          JSON.stringify({
            error: 'FILE_NOT_FOUND',
            message: `Cannot read file: ${filePath}`,
          }),
        );
        process.exit(1);
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        console.error(
          JSON.stringify({
            error: 'INVALID_JSON',
            message: `File is not valid JSON: ${filePath}`,
          }),
        );
        process.exit(1);
      }

      const result = ReviewSchema.safeParse(parsed);
      if (!result.success) {
        const issues = result.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; ');
        console.error(
          JSON.stringify({
            error: 'INVALID_SCHEMA',
            message: issues,
          }),
        );
        process.exit(1);
      }

      const { comments } = result.data;
      console.log(
        `Valid review output: ${comments.length} comment${comments.length !== 1 ? 's' : ''}`,
      );
    });
}
