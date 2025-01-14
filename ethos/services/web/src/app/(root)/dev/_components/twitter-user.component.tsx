import { css } from '@emotion/react';
import { X_SERVICE } from '@ethos/domain';
import { formatDate } from '@ethos/helpers';
import {
  Avatar,
  Button,
  Card,
  Col,
  Collapse,
  Flex,
  Form,
  Input,
  List,
  Result,
  Row,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { CodeBlock } from 'components/code-block/code-block.component';
import { CenteredLottieLoader } from 'components/loading-wrapper/lottie-loader.component';
import { tokenCssVars } from 'config/theme';
import { useTwitterProfile } from 'hooks/api/echo.hooks';
import { useLocalStorage } from 'hooks/use-storage';
import { useActivityActorsBulk } from 'hooks/user/activities';

const MAX_RECENTLY_SEARCHED = 10;
const { Text } = Typography;

const styles = {
  formCard: css({
    height: '100%',
  }),
  form: css({
    textAlign: 'right',
  }),
  input: css({
    backgroundColor: tokenCssVars.colorBgLayout,
  }),
  text: css({
    fontSize: 14,
  }),
  code: css({
    color: tokenCssVars.magenta7,
  }),
};

type FieldType = {
  search: string;
};

export function TwitterUser() {
  const [query, setQuery] = useState<FieldType['search']>('');
  const { data, isPending } = useTwitterProfile({ username: query });
  const [recentlySearched, setRecentlySearched] = useLocalStorage<string[]>(
    'recently-searched',
    [],
  );
  const { data: actors, isPending: isActorsPending } = useActivityActorsBulk(
    (recentlySearched ?? []).toReversed().map((id) => ({ service: X_SERVICE, account: id })),
  );

  useEffect(() => {
    if (!data) return;

    const copy = new Set(recentlySearched);

    // Delete existing occurrence of query
    copy.delete(data.id);
    // Add it back to the end of set
    copy.add(data.id);

    setRecentlySearched(Array.from(copy).slice(MAX_RECENTLY_SEARCHED * -1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, setRecentlySearched]);

  return (
    <Row gutter={[24, 24]}>
      <Col lg={8} xs={24}>
        <Card css={styles.formCard}>
          <Form<FieldType>
            layout="vertical"
            name="twitter-user-search"
            variant="outlined"
            onFinish={({ search }) => {
              setQuery(search);
            }}
            css={styles.form}
          >
            <Form.Item name="search" label="Twitter username" rules={[{ required: true }]}>
              <Input placeholder="username" css={styles.input} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Search
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
      <Col lg={16} xs={24}>
        {query.length > 0 && (
          <Card>
            <Flex vertical gap={tokenCssVars.marginXS}>
              {isPending ? (
                <CenteredLottieLoader />
              ) : data == null ? (
                <Result status="warning" title="User not found" />
              ) : (
                <>
                  <Avatar src={data.avatar} size={64} />
                  <Info name="ID" value={data.id} />
                  <Info name="Name" value={data.name} />
                  <Info name="Username" value={data.username} />
                  <Info name="Attestation hash" value={data.attestationHash} />
                  {data.joinedAt && (
                    <Info
                      name="Joined at"
                      value={formatDate(data.joinedAt, {
                        dateStyle: 'medium',
                        timeStyle: 'medium',
                      })}
                    />
                  )}
                  {typeof data.followersCount === 'number' && (
                    <Info name="Followers count" value={data.followersCount} />
                  )}
                  {data.biography && <Info name="Bio" value={data.biography} />}
                  {data && (
                    <Collapse
                      items={[{ key: 'json', label: 'JSON', children: <CodeBlock data={data} /> }]}
                    />
                  )}
                </>
              )}
            </Flex>
          </Card>
        )}
      </Col>
      {recentlySearched?.length ? (
        <Col lg={24}>
          <Card title="Recently searched">
            <List
              loading={isActorsPending}
              itemLayout="horizontal"
              dataSource={actors}
              renderItem={(actor) => (
                <List.Item
                  actions={[
                    <Button
                      key="view"
                      type="link"
                      disabled={!actor.username}
                      onClick={() => {
                        if (actor.username) {
                          setQuery(actor.username);
                        }
                      }}
                    >
                      View
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={actor.avatar} />}
                    title={<Text css={styles.text}>{actor.name}</Text>}
                    description={`@${actor.username}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      ) : null}
    </Row>
  );
}

function Info({ name, value }: { name: string; value: string | number }) {
  return (
    <Text css={styles.text}>
      {name}:{' '}
      <Text copyable code css={[styles.text, styles.code]}>
        {value}
      </Text>
    </Text>
  );
}
