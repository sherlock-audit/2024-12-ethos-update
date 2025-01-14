import { Button, Flex, Typography } from 'antd';

export function GetYourOwnMarketCard() {
  return (
    <div className="rounded-lg p-6 bg-advertisementCard">
      <div className="mt-2 dark:bg-[url(/assets/double-quote-dark.svg)] bg-[url(/assets/double-quote-light-alt.svg)] bg-top bg-no-repeat">
        <Flex justify="space-between" vertical align="center" gap={12}>
          <Typography.Title level={3} className="text-antd-colorBgBase text-center mt-6">
            Want to see what people really think about you?
          </Typography.Title>
          <Typography.Text className="text-antd-colorBgBase text-center">
            Make your own market and earn 0.5% of all trades.
          </Typography.Text>
          <Button
            href="https://app.deform.cc/form/8362e2e8-c6ab-41d3-8e79-53001868a128"
            target="_blank"
            rel="noopener noreferrer"
            className="text-advertisementCard w-full hover:!border-transparent"
          >
            I want my own market
          </Button>
        </Flex>
      </div>
    </div>
  );
}
