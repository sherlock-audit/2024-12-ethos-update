import { NetError } from '@ethos/helpers';

/**
 * Echo API has a standard error response format. This function extracts the
 * error message from the response body.
 */
export function extractEchoErrorMessage(err: unknown): string {
  let message = 'Something went wrong! Please try again later.';

  if (err instanceof NetError) {
    message = err.body?.error?.message ?? err.message;
  }

  return message;
}

export function extractEchoErrorCode(err: unknown): string | undefined {
  if (err instanceof NetError) {
    return err.body?.error?.code;
  }

  return undefined;
}
