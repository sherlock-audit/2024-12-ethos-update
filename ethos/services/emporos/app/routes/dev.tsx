import { config } from '~/config/config.server.ts';

/**
 * This is a dev-only playground for the early phases of the project.
 * Use it for whatever you need.
 */
export async function loader() {
  if (config.ETHOS_ENV !== 'local') {
    throw new Response('Not Found', { status: 404 });
  }

  return {};
}

export default function DevRoute() {
  return <div className="w-full" />;
}
