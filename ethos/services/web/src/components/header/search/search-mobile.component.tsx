import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import { css } from '@emotion/react';
import { Form, Input, Spin, List, Drawer, Flex } from 'antd';
import { type SubmitHandler } from 'react-hook-form';
import { SearchOption } from './search-option.component';
import { tokenCssVars } from 'config/theme';
import { useNavigateToUserkeyProfile } from 'hooks/search/use-search-navigation';
import { useSearchResults } from 'hooks/search/use-search-results';

type SearchBarProps = {
  open: boolean;
  onClose: () => void;
};

type Inputs = {
  search: string;
};

const searchHeaderStyles = css({
  padding: 16,
  background: tokenCssVars.colorBgElevated,
  borderBottom: `1px solid ${tokenCssVars.colorBorderSecondary}`,
});

const formItemStyles = css({
  margin: 0,
  minWidth: 0,
});

const searchResultsStyles = css({
  flex: 1,
  overflowY: 'auto',
  padding: 16,
});

const listStyles = css({
  '.ant-list-item': {
    padding: '8px 12px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokenCssVars.colorFillSecondary,
    },
  },
});

export function SearchBarMobile({ open, onClose }: SearchBarProps) {
  const [form] = Form.useForm<Inputs>();
  const value = Form.useWatch('search', form);
  const { actors, isFetching, debouncedValue } = useSearchResults(value);
  const { navigateToUserkeyProfile } = useNavigateToUserkeyProfile();

  // eslint-disable-next-line func-style
  const onSubmit: SubmitHandler<Inputs> = async ({ search }) => {
    form.resetFields();
    await navigateToUserkeyProfile(search);
  };

  return (
    <Drawer
      open={open}
      onClose={() => {
        form.resetFields();
        onClose();
      }}
      placement="bottom"
      height="85vh"
      styles={{
        body: { padding: 0 },
        header: { display: 'none' },
      }}
    >
      <Flex vertical css={{ height: '100%' }}>
        <div css={searchHeaderStyles}>
          <Form form={form} onFinish={onSubmit}>
            <Form.Item name="search" css={formItemStyles}>
              <Input
                autoFocus
                prefix={<SearchOutlined />}
                suffix={isFetching ? <Spin indicator={<LoadingOutlined spin />} /> : null}
                size="middle"
                placeholder="Search"
                spellCheck="false"
                autoCorrect="off"
              />
            </Form.Item>
          </Form>
        </div>

        <div css={searchResultsStyles}>
          <List
            css={listStyles}
            dataSource={actors}
            renderItem={(actor) => (
              <List.Item
                onClick={async () => {
                  form.resetFields();
                  onClose();
                  await navigateToUserkeyProfile(actor.userkey);
                }}
              >
                <SearchOption actor={actor} isStale={isFetching} />
              </List.Item>
            )}
            locale={{
              emptyText: !actors.length || debouncedValue?.trim() ? 'No results found' : null,
            }}
          />
        </div>
      </Flex>
    </Drawer>
  );
}
