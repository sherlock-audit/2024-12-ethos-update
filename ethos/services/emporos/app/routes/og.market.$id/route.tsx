import { duration } from '@ethos/helpers';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { MarketCardOG } from './components/market-card-og.tsx';
import { getFonts } from './utils/font.ts';
import { getMarketInfoByProfileId } from '~/services.server/markets.ts';

const oneHour = duration(1, 'hour').toSeconds();

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  if (!id) {
    return new Response('Market ID is required', { status: 404 });
  }

  const market = await getMarketInfoByProfileId(Number(id));

  if (!market) {
    return new Response('Market not found', { status: 404 });
  }

  try {
    const svg = await satori(<MarketCardOG market={market} />, {
      width: 1200,
      height: 630,
      fonts: getFonts(),
    });

    const data = new Resvg(svg).render().asPng();

    return new Response(data, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': `public, max-age=${oneHour}, immutable`,
      },
    });
  } catch (error) {
    console.error(error);

    return new Response('Failed to generate image', { status: 500 });
  }
}
