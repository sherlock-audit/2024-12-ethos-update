import { css } from '@emotion/react';
import { Col, Empty, Flex, theme, Typography } from 'antd';
import { type ReactNode } from 'react';
import { ArrowCircle } from 'components/icons';
import { tokenCssVars } from 'config/theme';
import { useThemeMode } from 'contexts/theme-manager.context';

const { useToken } = theme;

export function EmptyWrapper({
  children,
  isEmpty = false,
  description = 'No data',
  contentType = 'default',
}: React.PropsWithChildren<{
  isEmpty: boolean;
  description?: string;
  contentType?: 'comment' | 'default';
}>): ReactNode {
  const mode = useThemeMode();
  const imageURL = `/assets/images/illustrations/no_data${mode === 'dark' ? '_dark' : ''}.png`;

  const { token } = useToken();

  if (isEmpty || !children || (Array.isArray(children) && children?.length === 0)) {
    if (contentType === 'comment') {
      return (
        <Col span={24}>
          <Flex
            align="center"
            css={css`
              height: 100%;
            `}
          >
            <Flex
              css={css`
                height: 100px;
                padding: ${token.padding}px;
              `}
              gap={12}
              align="center"
            >
              <ArrowCircle
                css={css`
                  color: ${tokenCssVars.colorPrimary};
                  font-size: 72px;
                `}
              />
              <Flex vertical>
                <Typography.Text
                  css={css`
                    font-size: ${token.fontSizeXL}px;
                    line-height: 28px;
                  `}
                  strong
                >
                  First.
                </Typography.Text>
                <Typography.Text
                  css={css`
                    line-height: 22px;
                  `}
                >
                  Nobody has replied yet. Share your insights and get the conversation started!
                </Typography.Text>
              </Flex>
            </Flex>
          </Flex>
        </Col>
      );
    } else {
      return (
        <Col span={24}>
          <Flex
            justify="center"
            align="center"
            css={css`
              height: 100%;
            `}
          >
            <Empty
              image={imageURL}
              description={description}
              styles={{
                image: {
                  height: 63,
                },
              }}
            />
          </Flex>
        </Col>
      );
    }
  }

  return children;
}
