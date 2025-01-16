import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import { css, type SerializedStyles } from '@emotion/react';
import { AutoComplete, Form, Input, type InputRef, Spin } from 'antd';
import { useRef } from 'react';
import { type SubmitHandler } from 'react-hook-form';
import { useHotkeys } from 'react-hotkeys-hook';
import { SearchOption } from './search-option.component';
import { useNavigateToUserkeyProfile } from 'hooks/search/use-search-navigation';
import { useSearchResults } from 'hooks/search/use-search-results';

type Inputs = {
  search: string;
};

export function SearchBar({ wrapperCSS }: { wrapperCSS?: SerializedStyles }) {
  const [form] = Form.useForm<Inputs>();
  const inputRef = useRef<InputRef>(null);
  const { navigateToUserkeyProfile } = useNavigateToUserkeyProfile();

  // "mod" is Cmd on macOS and Ctrl on Windows
  useHotkeys(
    'mod+k',
    () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
    { preventDefault: true },
  );

  const value = Form.useWatch('search', form);
  const { actors, isFetching, debouncedValue } = useSearchResults(value);

  // eslint-disable-next-line func-style
  const onSubmit: SubmitHandler<Inputs> = async ({ search }) => {
    form.resetFields();
    await navigateToUserkeyProfile(search);
  };

  return (
    <Form form={form} onFinish={onSubmit} css={wrapperCSS}>
      <Form.Item
        name="search"
        css={css`
          margin: 0;
          min-width: 0px;
        `}
      >
        <AutoComplete
          id="header-search"
          popupMatchSelectWidth={false}
          css={css`
            height: auto;
            min-width: 0px;
            width: 215px;
            width: clamp(100px, 25vw, 400px);
          `}
          onSelect={async (newValue: string) => {
            if (!newValue?.trim()) return;
            form.resetFields();
            await navigateToUserkeyProfile(newValue);
          }}
          options={actors.map((actor) => ({
            value: actor.userkey,
            label: <SearchOption actor={actor} isStale={isFetching} />,
          }))}
          notFoundContent={!actors.length || debouncedValue?.trim() ? 'No results found' : null}
        >
          <Input
            prefix={<SearchOutlined />}
            suffix={isFetching ? <Spin indicator={<LoadingOutlined spin />} /> : <div />}
            size="middle"
            placeholder="Search"
            ref={inputRef}
            spellCheck="false"
            autoCorrect="off"
          />
        </AutoComplete>
      </Form.Item>
    </Form>
  );
}
