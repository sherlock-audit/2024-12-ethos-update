import { config } from '~/config/config.server.ts';

export function loader() {
  const environment = config.ETHOS_ENV;

  const robotText = `
User-agent: *
${environment === 'prod' ? 'Allow: /' : 'Disallow: /'}

User-agent: Twitterbot
Allow: /
  `.trim();

  return new Response(robotText, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
