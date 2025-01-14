import { MoonOutlined } from '@ant-design/icons';
import { type SerializedStyles } from '@emotion/react';
import { Flex, Switch } from 'antd';
import { useThemeMode, useThemeSetter } from '../../contexts/theme-manager.context';

export function ThemeToggle({
  labelCss,
  iconCss,
}: {
  labelCss: SerializedStyles;
  iconCss: SerializedStyles;
}) {
  const mode = useThemeMode();
  const setTheme = useThemeSetter();

  return (
    <Flex justify="space-between" align="center">
      <label htmlFor="theme-toggle" css={labelCss}>
        <MoonOutlined css={iconCss} />
        Dark mode
      </label>
      <Switch
        id="theme-toggle"
        defaultChecked={mode === 'dark'}
        onChange={() => {
          setTheme(mode === 'light' ? 'dark' : 'light');
        }}
      />
    </Flex>
  );
}
