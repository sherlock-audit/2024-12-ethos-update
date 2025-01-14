import { useRouteError, isRouteErrorResponse } from '@remix-run/react';
import { useEffect } from 'react';
import { LogoHeaderIcon, LogoHeaderTextIcon } from '~/components/icons/header-logo.tsx';

/**
 * WARNING: Ant Design Components will be unstyled in this component.
 *
 * Q: Why wouldn't styles be resolved?
 * A: In the event of a document mismatch during client hydration, React will throw away the entire document and re-render it client-side.
 *    This potentially throws away the inline styles added by rc-utils, an underlying package that Ant Design uses. When those styles are missing,
 *    Ant Design (rc-utils) will throw an error attempting to resolve them, which will trigger a re-render, and the cycle repeats.
 *    We also have a patch to rc-utils applied which addresses the exception.
 *
 * Q: What's the long-term fix?
 * A: This is a problem the Remix team is expecting to be addressed in React 19. Some developers are using the canary builds.
 *    https://github.com/remix-run/remix/issues/2947#issuecomment-2071160125
 *    A possible React 18 solution could be this: https://github.com/kiliman/remix-hydration-fix?tab=readme-ov-file
 * @returns
 */
export function RootErrorBoundary() {
  useClientNavigationSuppressor();
  const error = useRouteError();
  const goBack = (
    <div>
      <a href="/" className="text-antd-colorLink">
        Go Back
      </a>
    </div>
  );

  const errorContent = isRouteErrorResponse(error) ? (
    <div>
      <h1>
        {error.status} {error.statusText}
      </h1>
      <p>{error.data}</p>
      {goBack}
    </div>
  ) : (
    <div className="w-full text-wrap">
      <h1>Error</h1>
      <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
      <p>The stack trace is:</p>
      <pre className="text-wrap bg-antd-colorBgBase w-full overflow-x-clip break-all">
        {error instanceof Error ? error.stack : 'Unknown stack trace'}
      </pre>
      {goBack}
    </div>
  );

  return (
    <div className="text-antd-colorText h-full min-h-dvh bg-[url('/assets/layout-background-dark.svg')] bg-no-repeat bg-fixed bg-[right_293px]">
      <div className="sticky z-10 flex align-middle justify-between my-auto h-16 px-4 md:px-4 lg:px-12 bg-antd-colorBgContainer">
        {/* Purposefully use <a> not <Link> to avoid client-side navigation, which will cause Antd to throw an error given the styles are missing */}
        <a href="/" className="text-antd-colorLink flex items-center gap-4">
          <LogoHeaderIcon />
          <LogoHeaderTextIcon className="hidden md:flex" />
        </a>
      </div>
      <div className="py-8 overflow-none wrap flex justify-center w-full md:w-11/12 lg:w-5/6 xl:w-3/4 md:mx-auto px-4 lg:px-8 mt-8 mb-32 bg-antd-colorBgContainer rounded-lg">
        {errorContent}
      </div>
    </div>
  );
}

/**
 * Dear reader,
 * This is a hack. I'm sorry. Because the root error boundary rerenders the entire html element,
 * it loses its inline styles for Ant Design (rc-utils). So a client-side navigation will succeed,
 * but Ant components will be unstyled.
 *
 * As a workaround, we force a full SSR page load when navigating away from the root error boundary.
 *
 * Sincerest apologies,
 * Seth
 */
function useClientNavigationSuppressor() {
  useEffect(() => {
    function handlePopState() {
      window.location.href = window.location.pathname;
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
}
