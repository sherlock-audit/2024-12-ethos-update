import { css } from '@emotion/react';
import { type Review } from '@ethos/blockchain-manager';
import { type EthosUserTarget } from '@ethos/domain';
import { Button, Flex, Typography } from 'antd';
import { type UseFormReturn } from 'react-hook-form';
import { type ActivityTypeIconProps } from '../activity-cards/card-header-title.component';
import { ErrorList } from './error-list.component';
import { ReviewInputBlock } from './user-action-input-block.component';
import { type FormInputs } from './user-action-modal.types';
import { tokenCssVars } from 'config/theme';
import { type ScoreSimulationResult } from 'types/activity';

const baseFormStyles = css({
  height: '100%',
});

const formDisabledStyles = css({
  cursor: 'not-allowed',
});

const formEnabledStyles = css({
  cursor: 'auto',
});

const disabledContainerStyles = css({
  pointerEvents: 'none',
});

const enabledContainerStyles = css({
  pointerEvents: 'auto',
});

const titleStyles = css({
  paddingTop: 32,
  paddingBottom: 32,
  fontSize: 64,
  textAlign: 'center',
  lineHeight: 1,
});

const submitButtonStyles = css({
  background: tokenCssVars.colorInfo,
});

type Props = ActivityTypeIconProps & {
  target: EthosUserTarget;
  customInputBlock?: React.ReactNode;
  actionComponent?: React.ReactNode;
  isSubmitting: boolean;
  form: UseFormReturn<FormInputs>;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  title: string;
  score?: Review['score'];
  simulationChanged?: (simulation: ScoreSimulationResult) => void;
  customFooter?: React.ReactNode;
};

const { Title } = Typography;

export function UserActionModal({
  target,
  customInputBlock,
  actionComponent,
  form,
  isSubmitting,
  handleSubmit,
  title,
  type,
  score,
  simulationChanged,
  customFooter,
}: Props) {
  return (
    <form
      onSubmit={handleSubmit}
      css={[baseFormStyles, isSubmitting ? formDisabledStyles : formEnabledStyles]}
    >
      <div css={isSubmitting ? disabledContainerStyles : enabledContainerStyles}>
        <Title level={1} css={titleStyles}>
          {title}
        </Title>
        <ReviewInputBlock
          type={type}
          customInputBlock={customInputBlock}
          score={score}
          target={target}
          actionComponent={actionComponent}
          form={form}
          simulationChanged={simulationChanged}
          customFooter={customFooter}
        />
        <ErrorList form={form} />
        <Flex align="center" justify="center">
          <Button
            key="back"
            type="primary"
            htmlType="submit"
            size="large"
            loading={isSubmitting}
            css={submitButtonStyles}
          >
            {isSubmitting ? 'Publishing...' : 'Publish'}
          </Button>
        </Flex>
      </div>
    </form>
  );
}
