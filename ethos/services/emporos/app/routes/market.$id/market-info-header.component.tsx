import { useCopyToClipboard } from '@ethos/common-ui';
import { emporosUrlMap } from '@ethos/env';
import { formatCurrency } from '@ethos/helpers';
import { Link } from '@remix-run/react';
import { Flex, Typography, Col, Row, Tooltip, Card, Button, Popover } from 'antd';
import { MarketAvatar } from '~/components/avatar/market-avatar.component.tsx';
import { BarChartIcon } from '~/components/icons/bar-chart.tsx';
import { CalendarMonthIcon } from '~/components/icons/calendar-month.tsx';
import { McapIcon } from '~/components/icons/mcap.tsx';
import { ShareIcon } from '~/components/icons/share.tsx';
import { TwitterXIcon } from '~/components/icons/twitter-x.tsx';
import { VerifiedIcon } from '~/components/icons/verified.tsx';
import { RelativeDateTime } from '~/components/relative-time.component.tsx';
import { TooltipIconWrapper } from '~/components/tooltip/tooltip-icon-wrapper.tsx';
import { useEnvironment } from '~/hooks/env.tsx';
import { type Market } from '~/types/markets.ts';

const actionClassName =
  'bg-antd-colorBgLayout size-7 flex items-center justify-center rounded-4 text-antd-colorTextBase hover:opacity-80';

export function MarketInfoHeader({ market }: { market: Market }) {
  return (
    <Row
      gutter={[
        { xs: 16, sm: 16, md: 24 },
        { xs: 16, sm: 16, md: 24 },
      ]}
    >
      <Col span={24}>
        <Card
          classNames={{
            body: 'overflow-hidden',
          }}
        >
          <Flex align="center" gap={12} className="overflow-hidden">
            <MarketAvatar size="small" avatarUrl={market.avatarUrl} />
            <Flex vertical gap={4} className="min-w-0 flex-1">
              <Flex justify="space-between" className="w-full">
                <Flex vertical gap={4}>
                  <Flex gap={4} align="center">
                    <Popover
                      content={
                        <>
                          <Typography.Text>
                            This market was created by <b>{market.name}</b> and verified by{' '}
                            <b>Ethos</b>.
                          </Typography.Text>
                          <br />
                          <Typography.Text>
                            You can verify this by viewing the connected X.com account.
                          </Typography.Text>
                        </>
                      }
                    >
                      <TooltipIconWrapper>
                        <VerifiedIcon className="text-antd-colorSuccess text-sm" />
                      </TooltipIconWrapper>
                    </Popover>
                    <Typography.Text className="text-xs whitespace-nowrap text-antd-colorText">
                      Verified market
                    </Typography.Text>
                  </Flex>
                  <Typography.Text ellipsis className="whitespace-nowrap text-sm font-semibold">
                    Do you trust {market.name}?
                  </Typography.Text>
                </Flex>
                <MarketInfoHeaderActions market={market} />
              </Flex>
              <Flex gap={12} className="gap-x-3 gap-y-1 min-w-0 text-antd-red-3">
                <MarketInfoStat
                  tooltip="Volume"
                  icon={<BarChartIcon />}
                  value={formatCurrency(market.stats.volumeTotalUsd, 'USD')}
                />
                <MarketInfoStat
                  tooltip="Market cap"
                  icon={<McapIcon />}
                  value={formatCurrency(market.stats.marketCapUsd, 'USD')}
                />
                <MarketInfoStat
                  tooltip="Created at"
                  icon={<CalendarMonthIcon />}
                  value={<RelativeDateTime timestamp={market.createdAt} verbose />}
                />
              </Flex>
            </Flex>
          </Flex>
        </Card>
      </Col>
    </Row>
  );
}

function MarketInfoHeaderActions({ market }: { market: Market }) {
  const environment = useEnvironment();
  const copyToClipboard = useCopyToClipboard();

  return (
    <Flex align="center" gap={8} className="self-start">
      {market.twitterUsername && (
        <Link
          to={`https://x.com/${market.twitterUsername}`}
          target="_blank"
          rel="noreferrer"
          className={actionClassName}
        >
          <TwitterXIcon />
        </Link>
      )}
      <Button
        type="link"
        size="small"
        className={actionClassName}
        onClick={async () => {
          const url = new URL(`/market/${market.profileId}`, emporosUrlMap[environment]);
          await copyToClipboard(url.toString(), 'Market link copied');
        }}
      >
        <ShareIcon />
      </Button>
    </Flex>
  );
}

export function MarketInfoStat({
  icon,
  tooltip,
  value,
}: {
  icon: React.ReactNode;
  tooltip: string;
  value: React.ReactNode;
}) {
  return (
    <Flex gap={4} align="center">
      <Tooltip title={tooltip}>
        <TooltipIconWrapper className="text-antd-colorTextSecondary text-base">
          {icon}
        </TooltipIconWrapper>
      </Tooltip>
      <Typography.Text type="secondary" className="text-xs whitespace-nowrap">
        {value}
      </Typography.Text>
    </Flex>
  );
}
