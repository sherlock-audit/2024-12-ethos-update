import { usePrivy } from '@privy-io/react-auth';
import { Col, Flex, Row, Typography } from 'antd';
import { CodeBlock } from 'components/code-block/code-block.component';
import { CenteredLottieLoader } from 'components/loading-wrapper/lottie-loader.component';
import { useCurrentUser } from 'contexts/current-user.context';

const { Title } = Typography;

export function DebugUser() {
  const currentUser = useCurrentUser();
  const { user, ready, authenticated } = usePrivy();

  return (
    <Row gutter={24}>
      <Col lg={12} xs={24}>
        <Flex vertical gap={8}>
          <Title level={4} code>
            useCurrentUser()
          </Title>
          <CodeBlock data={currentUser} />
        </Flex>
      </Col>
      <Col lg={12} xs={24}>
        <Flex vertical gap={8}>
          <Title level={4} code>
            const {'{'} user {'}'} = usePrivy()
          </Title>
          {ready ? (
            authenticated ? (
              <CodeBlock data={user} />
            ) : (
              'Not authenticated'
            )
          ) : (
            <CenteredLottieLoader />
          )}
        </Flex>
      </Col>
    </Row>
  );
}
