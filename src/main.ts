import { getInputs } from './inputs';
import { setFailed } from '@actions/core';
import { autoCancel } from './autoCancel';

(async () => {
  try {
    await autoCancel(getInputs());
  } catch (err) {
    setFailed(err);
  }
})();
