import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useFetcher } from '@remix-run/react';
import { Flex, Switch } from 'antd';
import { useCallback } from 'react';
import { useThemeMode } from '~/theme/utils.ts';

export function ThemeToggle({ labelClass, iconClass }: { labelClass: string; iconClass: string }) {
  const fetcher = useFetcher();
  const currentTheme = useThemeMode();

  return (
    <fetcher.Form method="post" action="/action/set-theme">
      <Flex justify="space-between" align="center">
        <label htmlFor="theme-toggle" className={labelClass} style={{ cursor: 'pointer' }}>
          <MoonOutlined className={iconClass} />
          Dark mode
        </label>
        <Switch
          id="theme-toggle"
          defaultChecked={currentTheme === 'dark'}
          title="Dark mode"
          onChange={(checked) => {
            const theme = checked ? 'dark' : 'light';
            fetcher.submit({ theme }, { method: 'post', action: '/action/set-theme' });
          }}
        />
      </Flex>
    </fetcher.Form>
  );
}

export function useThemeToggle() {
  const fetcher = useFetcher();
  const currentTheme = useThemeMode();
  const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
  const themeIcon = currentTheme === 'light' ? <SunOutlined /> : <MoonOutlined />;

  const toggleTheme = useCallback(() => {
    fetcher.submit({ theme: nextTheme }, { method: 'post', action: '/action/set-theme' });
  }, [fetcher, nextTheme]);

  return { toggleTheme, currentTheme, nextTheme, themeIcon };
}
