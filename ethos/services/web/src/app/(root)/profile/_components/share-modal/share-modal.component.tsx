import { CopyOutlined, LinkOutlined, XOutlined } from '@ant-design/icons';
import { css } from '@emotion/react';
import { useCopyToClipboard } from '@ethos/common-ui';
import { type EthosUserTarget } from '@ethos/domain';
import { Modal, Button, Flex, Typography } from 'antd';
import { ProfileCard } from '../profile-card/profile-card.component';
import { useCopyElementAsImage } from 'hooks/use-copy-element-as-image';
import { useActor } from 'hooks/user/activities';
import { xComHelpers } from 'utils/tweets';

const { Title } = Typography;

type Props = {
  target: EthosUserTarget;
  isOpen: boolean;
  close: () => void;
};

export function ShareModal({ target, isOpen, close }: Props) {
  const { elementRef, copyToClipboard: copyImageToClipboard } =
    useCopyElementAsImage<HTMLDivElement>({
      successMessage: 'Profile card copied to clipboard!',
      errorMessage: 'Failed to copy profile card.',
    });
  const copyToClipboard = useCopyToClipboard();
  const actor = useActor(target);

  function handleTwitterShare() {
    const url = xComHelpers.shareProfileTweetUrl(
      window.location.href,
      actor.username ? `@${actor.username}` : actor.name,
    );
    window.open(url, '_blank');
  }

  return (
    <Modal
      open={isOpen}
      onCancel={close}
      footer={false}
      width={800}
      maskClosable={false}
      destroyOnClose
    >
      <Flex vertical gap="large">
        <Title
          level={2}
          css={css`
            text-align: center;
            margin-bottom: 0;
          `}
        >
          Share profile card
        </Title>

        <div
          ref={elementRef}
          css={css`
            width: 100%;
            max-width: 80%;
            height: 300px;
            margin: 0 auto;
            @media (max-width: 768px) {
              max-width: 100%;
            }
          `}
        >
          <ProfileCard target={target} hideDownloadIcon hideScoreBreakdown hideContributorXpInfo />
        </div>

        <Flex
          gap="middle"
          justify="center"
          wrap="wrap"
          css={css`
            @media (max-width: 768px) {
              gap: 8px;
              margin-top: 24px;
            }
          `}
        >
          {/* Button to copy the profile card as an image to the clipboard */}
          <Button
            icon={<CopyOutlined />}
            size="large"
            type="primary"
            css={css`
              @media (max-width: 768px) {
                width: 100%;
              }
            `}
            onClick={copyImageToClipboard}
          >
            Copy image
          </Button>
          {/* Button to copy the profile link to the clipboard */}
          <Button
            icon={<LinkOutlined />}
            size="large"
            type="primary"
            css={css`
              @media (max-width: 768px) {
                width: 100%;
              }
            `}
            onClick={() => {
              copyToClipboard(window.location.href, 'Profile link copied to clipboard!');
            }}
          >
            Copy link
          </Button>
          {/* Button to share on Twitter/x.com */}
          <Button
            icon={<XOutlined />}
            size="large"
            type="primary"
            css={css`
              @media (max-width: 768px) {
                width: 100%;
              }
            `}
            onClick={handleTwitterShare}
          >
            Share on X.com
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
}
