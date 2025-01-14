import { isValidEnsName } from '@ethos/helpers';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { getEnsDetailsByName } from '~/services.server/echo.ts';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const ensName = url.searchParams.get('ensName');

  if (!ensName || !isValidEnsName(ensName)) {
    return null;
  }

  const ensDetails = await getEnsDetailsByName(ensName);

  return ensDetails;
}
