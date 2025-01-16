import { type LoaderFunctionArgs } from '@remix-run/node';
import * as d3 from 'd3';
import { darkToken, lightToken } from '~/config/theme.ts';
import { MarketHistoryData, type MarketTrustHistoryData } from '~/data.server/price-history.ts';

const SVG_WIDTH = 640;
const SVG_HEIGHT = 400;
const BREATHING_ROOM_FACTOR = 1.1;

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { id } = params;
  const url = new URL(request.url);
  const token = url.searchParams.get('theme') === 'dark' ? darkToken : lightToken;
  const opacity = url.searchParams.get('theme') === 'dark' ? 1 : 0.85;

  if (!id) {
    return new Response('Market ID is required', { status: 400 });
  }

  const trustHistory = await MarketHistoryData.getMarketTrustPercentageHistory(
    Number(id),
    '30 minutes',
    '1D',
  );

  try {
    const area = getTrustHistoryGraphArea(trustHistory);

    const svgString = `
      <svg width="${SVG_WIDTH}" height="${SVG_HEIGHT}" preserveAspectRatio="none" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <path d="${area}" fill="${token.colorBgElevated}" opacity="${opacity}" />
      </svg>
    `;

    return new Response(svgString, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=60',
      },
    });
  } catch (err) {
    console.error(err);

    return new Response('Failed to generate SVG', { status: 500 });
  }
}

function getTrustHistoryGraphArea(trustHistory: MarketTrustHistoryData[]) {
  if (!trustHistory.length) {
    return null;
  }

  // Get the actual time range
  const now = new Date();
  const oldestDate = new Date(trustHistory[trustHistory.length - 1].timeBucket);

  const data: Array<[Date, number]> = [
    [new Date(), trustHistory[0].trustPercentage],
    ...trustHistory.map((x): [Date, number] => [x.timeBucket, x.trustPercentage]),
  ];

  // time on x-axis, scaled from oldest to newest
  const scaleX = d3.scaleTime().domain([oldestDate, now]).range([0, SVG_WIDTH]);

  // trust on y-axis, fixed domain from 0 to 100 with breathing room
  const scaleY = d3
    .scaleLinear()
    .domain([0, Number(BREATHING_ROOM_FACTOR)])
    .range([SVG_HEIGHT, 0]);

  const area = d3
    .area<[Date, number]>()
    .x(([x, _]) => scaleX(x))
    .y0(() => SVG_HEIGHT)
    .y1(([_, y]) => scaleY(y))
    .curve(d3.curveMonotoneX);

  const path = area(data);

  return path ?? null;
}
