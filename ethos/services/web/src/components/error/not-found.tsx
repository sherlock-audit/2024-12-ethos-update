'use client';
import { useIsMobile } from '@ethos/common-ui';
import { Button, Empty, Flex, Typography } from 'antd';
import { ErrorContainer } from './error-container';
import { ErrorHeader } from './error-header';
import { tokenCssVars } from 'config/theme';
import {
  HEADER_HEIGHT,
  MAIN_LAYOUT_PADDING_BOTTOM,
  MAIN_LAYOUT_PADDING_BOTTOM_MOBILE,
} from 'constant/constants';
import { useThemeMode } from 'contexts/theme-manager.context';

type NotFoundProps = {
  description?: string;
  height?: string;
  withErrorHeader?: boolean;
};

const DEFAULT_HEIGHT = `calc(${tokenCssVars.fullHeight} - ${HEADER_HEIGHT}px - ${MAIN_LAYOUT_PADDING_BOTTOM}px)`;
const DEFAULT_HEIGHT_MOBILE = `calc(${tokenCssVars.fullHeight} - ${HEADER_HEIGHT}px - ${MAIN_LAYOUT_PADDING_BOTTOM_MOBILE}px)`;

export function NotFound({
  description = 'We can’t find this URL',
  height,
  withErrorHeader,
}: NotFoundProps) {
  const mode = useThemeMode();
  const isMobile = useIsMobile();

  const computedHeight = height ?? (isMobile ? DEFAULT_HEIGHT_MOBILE : DEFAULT_HEIGHT);
  const imageURL = `/assets/images/illustrations/no_data${mode === 'dark' ? '_dark' : ''}.svg`;

  return (
    <Flex
      vertical
      css={{
        height: computedHeight,
        backgroundColor: tokenCssVars.colorBgContainer,
        width: '100%',
      }}
    >
      {withErrorHeader && <ErrorHeader />}
      <ErrorContainer>
        <Empty
          image={imageURL}
          description={null}
          styles={{
            image: {
              height: 92,
            },
          }}
        />
        <Flex vertical align="center" gap={8}>
          <Typography.Title level={1}>404</Typography.Title>
          <Typography.Text css={{ fontSize: 14, lineHeight: '22px' }}>
            {description}
          </Typography.Text>
        </Flex>
        <Button type="primary" href="/">
          Go home
        </Button>
      </ErrorContainer>
    </Flex>
  );
}
