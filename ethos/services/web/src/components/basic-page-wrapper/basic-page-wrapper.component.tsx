import { css } from '@emotion/react';
import { Col, Flex, Row, Typography } from 'antd';
import { type PropsWithChildren } from 'react';

type Props = PropsWithChildren<{ title: string }>;

const styles = {
  title: css({
    paddingTop: '18px',
    paddingBottom: '12px',
  }),
};

export function BasicPageWrapper({ children, title }: Props) {
  return (
    <Row>
      <Col span={24}>
        <Flex justify="flex-start" css={styles.title}>
          <Typography.Title level={2}>{title}</Typography.Title>
        </Flex>

        {children}
      </Col>
    </Row>
  );
}
