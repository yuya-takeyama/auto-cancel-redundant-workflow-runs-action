import { getInput } from '@actions/core';

export interface Inputs {
  githubToken: string;
}

export const getInputs = (): Inputs => {
  const githubToken = getInput('github-token', { required: true });

  return {
    githubToken,
  };
};
