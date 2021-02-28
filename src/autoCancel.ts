import { context } from '@actions/github';
import {
  cancelWorkflowRuns,
  getWorkflowRunsToCancel,
  parseWorkflowRun,
  WorkflowRunPayload,
} from './github';
import { Inputs } from './inputs';
import { Octokit } from '@octokit/core';
import { warning } from '@actions/core';

export const autoCancel = async (inputs: Inputs): Promise<void> => {
  const octokit = new Octokit({ auth: inputs.githubToken });
  const workflowRun = parseWorkflowRun(
    context.payload.workflow_run as WorkflowRunPayload,
  );
  const workflowRuns = await getWorkflowRunsToCancel({
    octokit,
    originWorkflowRun: workflowRun,
  });
  await cancelWorkflowRuns({ octokit, workflowRuns });

  if (workflowRuns.length === 0) {
    warning(`No Workflow Runs to cancel`);
  } else {
    for (const run of workflowRuns) {
      warning(`Cancelled: ${run.html_url}`);
    }
  }
};
