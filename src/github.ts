import { context } from '@actions/github';
import { debug } from '@actions/core';
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
  workflowRun: WorkflowRun;
};
export const getWorkflowRunsToCancel = async ({
  octokit,
  workflowRun,
}: getWorkflowRunsToCancelParams): Promise<WorkflowRunResponse[]> => {
  const res = await octokit.request(
    'GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs',
    {
      owner: context.repo.owner,
      repo: context.repo.repo,
      workflow_id: workflowRun.workflowId,
      branch: workflowRun.headBranch,
      per_page: 100,
    },
  );
  debug(`Origin Workflow Run ID: ${workflowRun.id}`);
  const workflowRuns = res.data.workflow_runs.filter(run => {
    const cancel =
      run.id !== workflowRun.id &&
      (run.status === 'queued' || run.status === 'in_progress');
    if (run.id === workflowRun.id) {
      debug(
        `Wokrflow Run ID: ${run.id}, status: ${run.status}:  Don't cancel the origin`,
      );
    } else {
      if (cancel) {
        debug(`Wokrflow Run ID: ${run.id}, status: ${run.status}:  Cancel`);
      } else {
        debug(
          `Wokrflow Run ID: ${run.id}, status: ${run.status}:  Don't cancel`,
        );
      }
    }
  });
  return workflowRuns;
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
    return octokit.request(
      'POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel',
      {
        owner: context.repo.owner,
        repo: context.repo.repo,
        run_id: run.id,
      },
    );
  });
  await Promise.all(cancelPromises);
};
