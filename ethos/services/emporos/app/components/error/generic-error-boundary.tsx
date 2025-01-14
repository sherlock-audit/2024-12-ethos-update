import { isRouteErrorResponse, useRouteError } from '@remix-run/react';
import { useEnvironment } from '~/hooks/env.tsx';

export function GenericErrorBoundary() {
  const error = useRouteError();
  const environment = useEnvironment();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div className="bg-antd-colorBgContainer w-full p-3 rounded-xl">
        <h1>Something went wrong</h1>
        <p>{error.message}</p>
        {['development', 'local'].includes(environment) && (
          <>
            <p>The stack trace is:</p>
            <pre className="overflow-x-auto">{error.stack}</pre>
          </>
        )}
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
