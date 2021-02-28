import { context } from '@actions/github';
import { Octokit } from '@octokit/core';
import { Endpoints } from '@octokit/types';

export interface WorkflowRunPayload {
  id: number;
  url: string;
  run_number: number;
  workflow_id: number;
  workflow_url: string;
  name: string;
  event: string;
  status: 'queued' | 'completed';
  conclusion: 'success' | 'failure' | null;
  head_branch: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowRun {
  id: number;
  url: string;
  runNumber: number;
  workflowId: number;
  workflowUrl: string;
  name: string;
  event: string;
  status: 'queued' | 'completed';
  conclusion: 'success' | 'failure' | null;
  headBranch: string;
  createdAt: Date;
  updatedAt: Date;
}

export const parseWorkflowRun = (payload: WorkflowRunPayload): WorkflowRun => {
  return {
    id: payload.id,
    url: payload.url,
    runNumber: payload.run_number,
    workflowId: payload.workflow_id,
    workflowUrl: payload.workflow_url,
    name: payload.name,
    event: payload.event,
    status: payload.status,
    conclusion: payload.conclusion,
    headBranch: payload.head_branch,
    createdAt: new Date(payload.created_at),
    updatedAt: new Date(payload.updated_at),
  };
};

type WorkflowRunResponse = Endpoints['GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs']['response']['data']['workflow_runs'][0];

type getWorkflowRunsToCancelParams = {
  octokit: Octokit;
  originWorkflowRun: WorkflowRun;
};
export const getWorkflowRunsToCancel = async ({
  octokit,
  originWorkflowRun,
}: getWorkflowRunsToCancelParams): Promise<WorkflowRunResponse[]> => {
  const res = await octokit.request(
    'GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs',
    {
      owner: context.repo.owner,
      repo: context.repo.repo,
      workflow_id: originWorkflowRun.workflowId,
      branch: originWorkflowRun.headBranch,
      event: originWorkflowRun.event,
      per_page: 100,
    },
  );
  return res.data.workflow_runs.filter(run => {
    return (
      run.id < originWorkflowRun.id &&
      (run.status === 'queued' || run.status === 'in_progress')
    );
  });
};

type cancelWorkflowRunsParams = {
  octokit: Octokit;
  workflowRuns: WorkflowRunResponse[];
};
export const cancelWorkflowRuns = async ({
  octokit,
  workflowRuns,
}: cancelWorkflowRunsParams): Promise<void> => {
  const cancelPromises = workflowRuns.map(async run => {
    await octokit.request(
      'POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel',
      {
        owner: context.repo.owner,
        repo: context.repo.repo,
        run_id: run.id,
      },
    );
    return;
  });
  await Promise.all(cancelPromises);
};
