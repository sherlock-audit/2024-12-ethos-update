import { css } from '@emotion/react';
import { formatXPScore } from '@ethos/helpers';
import { Flex, Tag, Typography } from 'antd';
import { EthosStar } from 'components/icons';
import { tokenCssVars } from 'config/theme';

const styles = {
  tag: css({
    color: tokenCssVars.colorPrimary,
    backgroundColor: tokenCssVars.colorBgBase,
    marginRight: 0,
  }),
  star: css({
    fontSize: '12px',
  }),
} as const;

type XpItemProps = {
  label: string;
  xp: number | string;
  unit?: string;
};

export function XpItem({ label, xp, unit }: XpItemProps) {
  return (
    <Flex justify="space-between" align="center" gap="small">
      <Typography.Text>{label}</Typography.Text>
      <Tag css={styles.tag}>
        <EthosStar css={styles.star} /> {typeof xp === 'number' ? formatXPScore(xp) : xp}
        {unit ? ` ${unit}` : ''}
      </Tag>
    </Flex>
  );
}
