import { formatDate } from '@ethos/helpers';
import {
  type CustomLayerProps,
  ResponsiveLine,
  type LineProps,
  type CustomLayer,
} from '@nivo/line';
import { type ScaleTime, type ScaleLinear } from '@nivo/scales';
import { theme, Typography } from 'antd';
import clsx from 'clsx';
import { useMemo } from 'react';
import { formatEther } from 'viem';
import { ThumbsDownOutlinedIcon, ThumbsUpOutlinedIcon } from '~/components/icons/thumbs.tsx';
import { tailwindTheme } from '~/theme/tailwindTheme.tsx';
import { type MarketPriceHistory, type ChartWindow } from '~/types/charts.ts';

export type PriceType = 'trust' | 'distrust';

const TIME_WINDOW_FORMATTERS: Record<ChartWindow, (value: Date) => string> = {
  '1H': (value) => formatDate(value, { hour: 'numeric', minute: '2-digit' }),
  '1D': (value) => formatDate(value, { hour: 'numeric', minute: '2-digit' }),
  '7D': (value) => formatDate(value, { weekday: 'short', hour: 'numeric' }),
  '1M': (value) => formatDate(value, { month: 'short', day: '2-digit' }),
  '1Y': (value) => formatDate(value, { month: 'short', day: 'numeric', year: '2-digit' }),
};

type LineData = { id: PriceType; data: Array<{ x: Date; y: number }> };

type PriceHistoryChartProps = {
  maxPriceEth: number;
  data: Array<{ time: Date; trust: number; distrust: number }>;
};

type CustomLineLayerProps = Omit<CustomLayerProps, 'xScale' | 'yScale'> & {
  xScale: ScaleTime<number>;
  yScale: ScaleLinear<string | number | Date>;
};

function votePriceToPercentage(maxPriceEth: number, price: number): number {
  if (!price) return 0;
  const percentage = (price / maxPriceEth) * 100;

  return percentage;
}

function useScaleTicks(
  maxPriceEth: number,
  data: PriceHistoryChartProps['data'],
  tickCount: number | undefined = 10,
) {
  const { minValue, maxValue, yAxisTickValues } = useMemo(() => {
    // Find min and max values from both trust and distrust data
    const allValues = data.flatMap((point) => [point.trust, point.distrust]);
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);

    // Convert to percentages (maxPriceEth = 100%)
    const minPercent = Math.floor((min / maxPriceEth) * 100);
    const maxPercent = Math.ceil((max / maxPriceEth) * 100);

    // Round to nearest 10% and add padding
    const roundedMin = Math.max(0, Math.floor((minPercent - 10) / 10) * 10);
    const roundedMax = Math.min(100, Math.ceil((maxPercent + 10) / 10) * 10);

    // Calculate step size based on desired tick count
    const range = roundedMax - roundedMin;
    const stepSize = Math.ceil(range / (tickCount - 1) / 10) * 10;

    // Generate tick values using calculated step size
    const ticks = Array.from(
      { length: Math.floor(range / stepSize) + 1 },
      (_, i) => ((roundedMin + i * stepSize) * maxPriceEth) / 100,
    );

    return {
      minValue: (roundedMin * maxPriceEth) / 100,
      maxValue: (roundedMax * maxPriceEth) / 100,
      yAxisTickValues: ticks,
    };
  }, [data, maxPriceEth, tickCount]);

  return { minValue, maxValue, yAxisTickValues };
}

type TooltipProps = {
  timestamp: Date;
  seriesValues: Array<{ ethPrice: number; percentage: number; seriesType: PriceType }>;
};
type BasePriceHistoryChartProps = PriceHistoryChartProps & {
  bottomAxisConfig: Omit<LineProps['axisBottom'], 'tickValues'> & {
    tickCount?: number;
  };
  rightAxisConfig: Omit<LineProps['axisRight'], 'tickValues'> & {
    tickCount?: number;
  };
  customLayers?: CustomLayer[];
  tooltip: (props: TooltipProps) => JSX.Element;
  margin?: LineProps['margin'];
};

const colors = {
  trust: tailwindTheme.colors.trust,
  distrust: tailwindTheme.colors.distrust,
};

export function BasePriceHistoryChart({
  maxPriceEth,
  data: rawData,
  bottomAxisConfig,
  rightAxisConfig,
  customLayers = [],
  tooltip,
  margin,
}: BasePriceHistoryChartProps) {
  const { token } = theme.useToken();
  const { minValue, maxValue, yAxisTickValues } = useScaleTicks(
    maxPriceEth,
    rawData,
    rightAxisConfig.tickCount,
  );

  const formattedData = useMemo<LineData[]>(() => {
    return [
      {
        id: 'trust',
        data: rawData.map((point) => ({
          x: point.time,
          y: point.trust,
        })),
      },
      {
        id: 'distrust',
        data: rawData.map((point) => ({
          x: point.time,
          y: point.distrust,
        })),
      },
    ];
  }, [rawData]);

  return (
    <ResponsiveLine
      layers={['grid', 'markers', 'axes', 'areas', 'crosshair', 'lines', 'slices', ...customLayers]}
      data={formattedData}
      curve="monotoneX"
      margin={margin}
      yFormat={(value) => `${votePriceToPercentage(maxPriceEth, Number(value)).toFixed(0)}%`}
      axisTop={null}
      axisLeft={null}
      axisRight={{
        tickValues: yAxisTickValues,
        ...rightAxisConfig,
      }}
      axisBottom={{
        tickValues: (() => {
          const data = formattedData[0]?.data || [];
          const totalPoints = data.length;
          const interval = Math.max(1, Math.floor(totalPoints / (bottomAxisConfig.tickCount ?? 8)));

          return data.filter((_, i) => i % interval === 0).map((d) => d.x);
        })(),
        ...bottomAxisConfig,
      }}
      yScale={{
        type: 'linear',
        min: minValue,
        max: maxValue,
        clamp: true,
      }}
      // Custom Tooltip
      sliceTooltip={({ slice }) => {
        // Sort points to ensure trust comes before distrust
        const sortedPoints = [...slice.points].sort((a) => (a.serieId === 'trust' ? -1 : 1));

        return tooltip({
          timestamp: new Date(sortedPoints[0].data.x),
          seriesValues: sortedPoints.map((point) => ({
            ethPrice: Number(point.data.y),
            percentage: votePriceToPercentage(maxPriceEth, Number(point.data.y)),
            seriesType:
              point.serieId === 'trust' ? ('trust' as PriceType) : ('distrust' as PriceType),
          })),
        });
      }}
      enableGridX={false}
      enableGridY={false}
      enablePoints={false}
      colors={[colors.trust, colors.distrust]}
      enableArea={false}
      areaOpacity={0.15}
      enableSlices="x"
      crosshairType="cross"
      theme={{
        text: {
          color: token.colorTextTertiary,
        },
        legends: {
          text: {
            fill: token.colorTextTertiary,
          },
          ticks: {
            text: {
              fill: token.colorTextTertiary,
            },
          },
        },
        axis: {
          ticks: {
            text: {
              fill: token.colorTextTertiary,
            },
          },
        },
      }}
    />
  );
}

export function FullSizePriceHistoryChart({
  maxPriceEth,
  priceHistoryData,
  chartWindow,
}: {
  priceHistoryData: MarketPriceHistory;
  chartWindow: ChartWindow;
  maxPriceEth: number;
}) {
  const priceHistoryChartData = useMemo(() => {
    if (!priceHistoryData) return [];

    return priceHistoryData.data.map((value) => ({
      time: value.time,
      trust: Number(formatEther(BigInt(value.trust), 'wei')),
      distrust: Number(formatEther(BigInt(value.distrust), 'wei')),
    }));
  }, [priceHistoryData]);

  const rightAxisConfig = useMemo(() => {
    return {
      format: (value: any) => `${Math.round((Number(value) / maxPriceEth) * 100)}%`,
      tickSize: 0,
      tickPadding: 25,
    };
  }, [maxPriceEth]);

  const bottomAxisConfig = useMemo(() => {
    return {
      format: (value: Date) => TIME_WINDOW_FORMATTERS[chartWindow](value),
      tickRotation: -45,
      tickPadding: 10,
      tickSize: 0,
    };
  }, [chartWindow]);

  return (
    <BasePriceHistoryChart
      maxPriceEth={maxPriceEth}
      data={priceHistoryChartData}
      bottomAxisConfig={bottomAxisConfig}
      rightAxisConfig={rightAxisConfig}
      margin={{ top: 20, right: 70, bottom: 60, left: 50 }}
      customLayers={[(props) => <LatestValueLayer {...props} maxPriceEth={maxPriceEth} />]}
      tooltip={(props) => <LargeTooltip {...props} chartWindow={chartWindow} />}
    />
  );
}

export function CompactPriceHistoryChart({
  maxPriceEth,
  priceHistoryData,
  chartWindow,
}: {
  priceHistoryData: MarketPriceHistory;
  chartWindow: ChartWindow;
  maxPriceEth: number;
}) {
  const priceHistoryChartData = useMemo(() => {
    if (!priceHistoryData) return [];

    return priceHistoryData.data.map((value) => ({
      time: value.time,
      trust: Number(formatEther(BigInt(value.trust), 'wei')),
      distrust: Number(formatEther(BigInt(value.distrust), 'wei')),
    }));
  }, [priceHistoryData]);

  const rightAxisConfig = useMemo(() => {
    return {
      format: (value: any) => `${Math.round((Number(value) / maxPriceEth) * 100)}%`,
      tickSize: 0,
      tickPadding: 25,
      tickCount: 6,
    };
  }, [maxPriceEth]);

  const bottomAxisConfig = useMemo(() => {
    return {
      format: (value: Date) => TIME_WINDOW_FORMATTERS[chartWindow](value),
      tickPadding: 10,
      tickSize: 0,
      tickCount: 3,
    };
  }, [chartWindow]);

  return (
    <BasePriceHistoryChart
      maxPriceEth={maxPriceEth}
      data={priceHistoryChartData}
      bottomAxisConfig={bottomAxisConfig}
      rightAxisConfig={rightAxisConfig}
      margin={{ top: 20, right: 50, bottom: 40, left: 30 }}
      tooltip={(props) => <CompactTooltip {...props} chartWindow={chartWindow} />}
      customLayers={[(props) => <VoteTypeIconLayer {...props} />]}
    />
  );
}

function LargeTooltip({
  timestamp,
  seriesValues,
  chartWindow,
}: TooltipProps & { chartWindow: ChartWindow }) {
  return (
    <div className="bg-antd-colorBgLayout py-4 px-10 flex flex-col gap-2 rounded-lg">
      <Typography.Text className="text-antd-colorTextSecondary">
        {TIME_WINDOW_FORMATTERS[chartWindow](timestamp)}
      </Typography.Text>
      {seriesValues.map((v) => (
        <div
          key={v.seriesType}
          className={clsx('flex items-center gap-1', {
            'text-distrust': v.seriesType === 'distrust',
            'text-trust': v.seriesType === 'trust',
          })}
        >
          {v.seriesType === 'distrust' ? (
            <ThumbsDownOutlinedIcon style={{ fontSize: 14 }} />
          ) : (
            <ThumbsUpOutlinedIcon style={{ fontSize: 14 }} />
          )}
          <span>{v.seriesType}</span>
          <span>{`${v.percentage.toFixed(0)}%`}</span>
        </div>
      ))}
    </div>
  );
}

function CompactTooltip({
  timestamp,
  seriesValues,
  chartWindow,
}: TooltipProps & { chartWindow: ChartWindow }) {
  return (
    <div className="bg-antd-colorBgLayout py-4 px-3 flex flex-col gap-1 rounded-lg">
      <Typography.Text className="text-antd-colorTextSecondary">
        {TIME_WINDOW_FORMATTERS[chartWindow](timestamp)}
      </Typography.Text>
      {seriesValues.map((v) => (
        <div
          key={v.seriesType}
          className={clsx('flex items-center gap-1', {
            'text-distrust': v.seriesType === 'distrust',
            'text-trust': v.seriesType === 'trust',
          })}
        >
          {v.seriesType === 'distrust' ? (
            <ThumbsDownOutlinedIcon style={{ fontSize: 14 }} />
          ) : (
            <ThumbsUpOutlinedIcon style={{ fontSize: 14 }} />
          )}
          <span>{v.seriesType}</span>
          <span>{`${v.percentage.toFixed(0)}%`}</span>
        </div>
      ))}
    </div>
  );
}

function VoteTypeIconLayer({ data, xScale, yScale }: CustomLineLayerProps) {
  if (!data[0].data.length) return null;

  return (
    <g>
      {data.map((series) => {
        const lastPoint = series.data[series.data.length - 1];
        // @ts-expect-error nivo types are poor
        const x = xScale(lastPoint.x);
        // @ts-expect-error nivo types are poor
        const y = yScale(lastPoint.y);
        const isDistrust = series.id === 'distrust';

        return (
          <g key={series.id} transform={`translate(${x}, ${y.toString()})`}>
            <rect
              x={8}
              y={-12}
              width={28}
              height={24}
              rx={4}
              fill={isDistrust ? tailwindTheme.colors.distrustBg : tailwindTheme.colors.trustBg}
            />
            <foreignObject x={15} y={-9} width={16} height={16}>
              {isDistrust ? (
                <ThumbsDownOutlinedIcon
                  style={{
                    fontSize: 14,
                    color: colors.distrust,
                  }}
                />
              ) : (
                <ThumbsUpOutlinedIcon
                  style={{
                    fontSize: 14,
                    color: colors.trust,
                  }}
                />
              )}
            </foreignObject>
          </g>
        );
      })}
    </g>
  );
}

function LatestValueLayer({
  data,
  xScale,
  yScale,
  maxPriceEth,
}: CustomLineLayerProps & { maxPriceEth: number }) {
  if (!data[0].data.length) return null;

  return (
    <g>
      {data.map((series) => {
        const lastPoint = series.data[series.data.length - 1];
        // @ts-expect-error nivo types are poor
        const x = xScale(lastPoint.x);
        // @ts-expect-error nivo types are poor
        const y = yScale(lastPoint.y);
        const isDistrust = series.id === 'distrust';

        return (
          <g key={series.id} transform={`translate(${x}, ${y.toString()})`}>
            <rect
              x={8}
              y={-12}
              width={60}
              height={24}
              rx={4}
              fill={isDistrust ? tailwindTheme.colors.distrustBg : tailwindTheme.colors.trustBg}
            />
            <foreignObject x={15} y={-9} width={16} height={16}>
              {isDistrust ? (
                <ThumbsDownOutlinedIcon
                  style={{
                    fontSize: 14,
                    color: colors.distrust,
                  }}
                />
              ) : (
                <ThumbsUpOutlinedIcon
                  style={{
                    fontSize: 14,
                    color: colors.trust,
                  }}
                />
              )}
            </foreignObject>
            <text
              x={32}
              y={4}
              textAnchor="start"
              style={{
                fill: isDistrust ? colors.distrust : colors.trust,
                fontSize: 12,
              }}
            >
              {votePriceToPercentage(maxPriceEth, Number(lastPoint.y)).toFixed(0)}%
            </text>
          </g>
        );
      })}
    </g>
  );
}
