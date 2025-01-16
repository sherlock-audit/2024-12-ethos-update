'use client';

import { Button, Flex, Form, Input, Tabs, type TabsProps } from 'antd';
import { useState } from 'react';
import { MigrationTable } from './_components/migration-table.component';
import { AuthRequiredWrapper } from 'components/auth/auth-required-wrapper.component';
import { BasicPageWrapper } from 'components/basic-page-wrapper/basic-page-wrapper.component';

type FormFields = {
  query: string;
};

type TabKey = 'pending' | 'transferred';

export default function Page() {
  const [form] = Form.useForm<FormFields>();
  const [query, setQuery] = useState<string>('');
  const [activeKey, setActiveKey] = useState<TabKey>('pending');

  const items = [
    {
      key: 'pending',
      label: 'Pending',
      children: <MigrationTable query={query} />,
    },
    {
      key: 'transferred',
      label: 'Transferred',
      children: <MigrationTable onlyTransferred />,
    },
  ] as const satisfies TabsProps['items'];

  return (
    <BasicPageWrapper title="Import from testnet">
      <AuthRequiredWrapper>
        <Flex justify="space-between" align="center">
          <Tabs
            items={items}
            animated
            activeKey={activeKey}
            onChange={(key) => {
              setActiveKey(key as TabKey);
            }}
            tabBarExtraContent={{
              right: (
                <Form
                  form={form}
                  name="search"
                  layout="inline"
                  onFinish={({ query }) => {
                    setQuery(query.trim());
                    setActiveKey('pending');
                  }}
                >
                  <Form.Item
                    name="query"
                    rules={[
                      {
                        required: true,
                        message: 'Please input your X.com address or address you used on Testnet',
                      },
                    ]}
                    label="X.com address or address you used on Testnet"
                    colon={false}
                  >
                    <Input placeholder="username or 0x123" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit">
                    Search
                  </Button>
                </Form>
              ),
            }}
          />
        </Flex>
      </AuthRequiredWrapper>
    </BasicPageWrapper>
  );
}
