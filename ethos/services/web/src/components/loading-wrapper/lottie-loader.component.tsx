import { css } from '@emotion/react';
import { type EthosTheme } from '@ethos/common-ui';
import { Flex } from 'antd';
import dynamic from 'next/dynamic';
import animationDataDark from './lottie-loader-dark.json' with { type: 'json' };
import animationDataLight from './lottie-loader-light.json' with { type: 'json' };
import { useThemeMode } from 'contexts/theme-manager.context';

// A workaround to make lottie-react work with SSR
// Issue: https://github.com/Gamote/lottie-react/issues/101
// It was fixed in this PR but it's not released yet: https://github.com/airbnb/lottie-web/pull/3096
// TODO: revert to the regular import when the issue is fixed
const Lottie = dynamic(async () => await import('lottie-react'), { ssr: false });

type LottieLoaderProps = {
  size?: number;
  text?: string;
  mode?: EthosTheme;
};

export function LottieLoader({ size = 40, text, mode }: LottieLoaderProps) {
  const contextMode = useThemeMode();

  return (
    <Flex
      align="center"
      justify="center"
      gap={2}
      css={css({
        display: 'inline-flex',
      })}
    >
      <Lottie
        animationData={(mode ?? contextMode) === 'dark' ? animationDataLight : animationDataDark}
        loop
        autoplay
        css={css({
          width: size,
          height: size,
        })}
      />
      <span>{text}</span>
    </Flex>
  );
}

type CenteredLottieLoaderProps = {
  padding?: number;
  fullWidth?: boolean;
  fullHeight?: boolean;
} & LottieLoaderProps;

export function CenteredLottieLoader({
  size,
  text,
  padding,
  fullHeight,
  fullWidth,
  mode,
}: CenteredLottieLoaderProps) {
  return (
    <Flex
      justify="center"
      align="center"
      css={css({
        width: fullWidth ? '100%' : undefined,
        height: fullHeight ? '100%' : undefined,
        paddingBlock: padding ? `${padding}px` : undefined,
      })}
    >
      <LottieLoader size={size} text={text} mode={mode} />
    </Flex>
  );
}

export function PageLottieLoader() {
  return <CenteredLottieLoader size={48} fullWidth padding={200} />;
}
