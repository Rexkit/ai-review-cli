import { GitProvider } from '../providers/base';
import { FileDiff } from '../providers/base';

export interface MRContext {
  title: string;
  description: string;
  sourceBranch: string;
  targetBranch: string;
  reviewLanguage: string;
  files: FileDiff[];
}

export class MRContextBuilder {
  constructor(
    private readonly provider: GitProvider,
    private readonly reviewLanguage: string = 'English',
  ) {}

  /**
   * Fetches MR metadata and file diffs, returning a normalized MRContext
   * ready for LLM consumption.
   */
  async build(projectId: string, mrId: string): Promise<MRContext> {
    const [mr, files] = await Promise.all([
      this.provider.getMergeRequest(projectId, mrId),
      this.provider.getMergeRequestChanges(projectId, mrId),
    ]);

    return {
      title: mr.title,
      description: mr.description,
      sourceBranch: mr.sourceBranch,
      targetBranch: mr.targetBranch,
      reviewLanguage: this.reviewLanguage,
      files,
    };
  }
}
