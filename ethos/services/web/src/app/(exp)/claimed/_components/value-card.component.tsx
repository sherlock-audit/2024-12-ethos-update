import { css } from '@emotion/react';
import { useIsMobile } from '@ethos/common-ui';
import { Card, Flex, theme, Typography } from 'antd';
import { type ReactNode } from 'react';

type ValueCardProps = {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  valueColor?: string;
  extra?: ReactNode;
};

const styles = {
  card: css({
    width: '100%',
    maxWidth: '500px',
  }),
  cardBodySm: {
    paddingInline: '16px',
    paddingBlock: '20px',
  },
  cardBodyLg: {
    padding: '24px',
  },
  cardTitle: {
    color: 'inherit',
    fontSize: '14px',
  },
};

export function ValueCard({ title, value, icon, valueColor, extra }: ValueCardProps) {
  const { token } = theme.useToken();
  const isMobile = useIsMobile();

  return (
    <Card
      css={styles.card}
      styles={{
        body: isMobile ? styles.cardBodySm : styles.cardBodyLg,
      }}
    >
      <Flex vertical gap={token.marginSM} align="center">
        <Typography.Text css={styles.cardTitle} type="secondary">
          {title}
        </Typography.Text>
        <Flex gap={token.marginSM}>
          <Typography.Title
            level={1}
            css={css({
              color: valueColor,
            })}
            type="secondary"
          >
            <Flex align="center" gap={token.marginXS}>
              {value}
              <span
                css={css({
                  fontSize: '66%',
                })}
              >
                {icon}
              </span>
            </Flex>
          </Typography.Title>
        </Flex>
        {extra}
      </Flex>
    </Card>
  );
}
