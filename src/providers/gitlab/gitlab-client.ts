import axios, { AxiosInstance } from 'axios';

export class GitLabClient {
  private client: AxiosInstance;

  constructor(baseUrl: string, token: string) {
    this.client = axios.create({
      baseURL: `${baseUrl.replace(/\/$/, '')}/api/v4`,
      headers: {
        'PRIVATE-TOKEN': token,
        'Content-Type': 'application/json',
      },
    });
  }

  async getMergeRequest(projectId: string, mrIid: string): Promise<unknown> {
    const encodedProjectId = encodeURIComponent(projectId);
    const response = await this.client.get(
      `/projects/${encodedProjectId}/merge_requests/${mrIid}`,
    );
    return response.data;
  }

  async getMergeRequestChanges(
    projectId: string,
    mrIid: string,
  ): Promise<unknown> {
    const encodedProjectId = encodeURIComponent(projectId);
    const response = await this.client.get(
      `/projects/${encodedProjectId}/merge_requests/${mrIid}/changes`,
    );
    return response.data;
  }

  async postDiscussion(
    projectId: string,
    mrIid: string,
    body: string,
    position?: Record<string, unknown>,
  ): Promise<unknown> {
    const encodedProjectId = encodeURIComponent(projectId);
    const payload: Record<string, unknown> = { body };
    if (position) {
      payload.position = position;
    }
    const response = await this.client.post(
      `/projects/${encodedProjectId}/merge_requests/${mrIid}/discussions`,
      payload,
    );
    return response.data;
  }
}
