// The async version ensures that it's not included in the main build and
// extracted into a separate chunk that is only loaded when needed.
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { tokenCssVars } from 'config/theme';
import { useThemeMode } from 'contexts/theme-manager.context';

export function CodeBlock({ data }: { data: unknown }) {
  const mode = useThemeMode();

  return (
    <SyntaxHighlighter
      language="json"
      // eslint-disable-next-line react/forbid-component-props
      style={mode === 'light' ? vs : vscDarkPlus}
      customStyle={{
        backgroundColor: tokenCssVars.colorBgContainer,
        borderRadius: tokenCssVars.borderRadiusLG,
      }}
      codeTagProps={{ style: { whiteSpace: 'pre-wrap' } }}
    >
      {JSON.stringify(data, null, 2)}
    </SyntaxHighlighter>
  );
}
