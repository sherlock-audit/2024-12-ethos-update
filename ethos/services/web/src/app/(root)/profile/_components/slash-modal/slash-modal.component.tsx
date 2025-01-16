import { css } from '@emotion/react';
import { type EthosUserTarget, ScoreImpact } from '@ethos/domain';
import { useFeatureGate } from '@statsig/react-bindings';
import { Modal, Segmented, Flex, InputNumber, Typography } from 'antd';
import { useState, useEffect } from 'react';
import { useForm, Controller, useFormContext, FormProvider } from 'react-hook-form';
import { featureGates } from '../../../../../constant/feature-flags';
import { UserAvatar } from 'components/avatar/avatar.component';
import { Ethereum, Logo } from 'components/icons';
import { ScoreDifference } from 'components/score-difference/score-difference.component';
import { UserActionModal } from 'components/user-action-modal/user-action-modal.component';
import { type FormInputs } from 'components/user-action-modal/user-action-modal.types';
import { tokenCssVars } from 'config/theme';
import { useCurrentUser } from 'contexts/current-user.context';
import { useActor } from 'hooks/user/activities';
import { useScore } from 'hooks/user/lookup';

// Local constant for slash activity - not part of domain ActivityType
const SLASH_ACTIVITY = 'slash';

const inputStyles = css({
  borderRadius: 8,
  width: 100,
  '& .ant-input-number-input': {
    textAlign: 'right',
    '&::placeholder': {
      textAlign: 'left',
    },
  },
  '& .ant-input-number-handler-wrap': {
    display: 'none',
  },
  '&:hover .ant-input-number-suffix': {
    marginInlineEnd: 'var(--ant-input-number-padding-inline)',
  },
  '&:focus, &:focus-within': {
    boxShadow: 'none',
  },
});

const transparentBorderStyle = css({
  border: '1px solid transparent',
});

const inputSuffixIconStyle = css({
  fontSize: 18,
  color: tokenCssVars.colorText,
});

const footerContainerStyle = css({
  width: '100%',
  backgroundColor: tokenCssVars.colorBgBase,
  height: 35,
});

const scoreDisplayStyle = css({
  backgroundColor: tokenCssVars.colorBgContainer,
  borderRadius: 3,
});

const modalContentStyle = css({
  '.ant-modal-content': {
    padding: '0px',
  },
});

const modalContentDefaultStyle = css({
  '.ant-modal-content': {
    padding: undefined,
  },
});

const slashTypeSelectorStyle = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 10,
});

const slashTypeSelectorInnerStyle = css({
  display: 'flex',
  justifyContent: 'center',
});

const footerPaddingStyle = css({
  padding: '0 24px',
});

const scoreDisplayPaddingStyle = css({
  padding: '0 4px',
});

type Props = {
  target: EthosUserTarget;
  isOpen: boolean;
  close: (successful: boolean) => void;
};

const ERROR_MESSAGES = {
  title: 'Your slash must include a title.',
  score: 'Score is required',
};

type SlashType = 'credibilityScore' | 'financial';

function calculateMaxSlashAmount(slasherScore?: number, targetScore?: number): number {
  if (!slasherScore || !targetScore) return 0;

  const slasherMax = Math.floor(slasherScore / 8);
  const targetMax = Math.floor(targetScore / 3);

  return Math.min(slasherMax, targetMax);
}

function SlashAction({ maxAmount }: { maxAmount: number }) {
  const { formState, setError, clearErrors, watch, control } = useFormContext<FormInputs<number>>();
  const isErrored = Boolean(formState.errors.value);
  const value = watch('value');

  useEffect(() => {
    if (value && value > maxAmount) {
      setError('value', {
        type: 'manual',
        message: `The max amount you can provide as a bond for slashing this target is ${maxAmount.toFixed(0)} credibility score`,
      });
    } else {
      clearErrors('value');
    }
  }, [value, maxAmount, setError, clearErrors]);

  return (
    <Flex vertical align="flex-end">
      <Controller
        control={control}
        name="value"
        rules={{ required: 'Score is required' }}
        render={({ field: { onChange, value } }) => {
          return (
            <Flex align="center" justify="flex-end">
              <InputNumber
                status={isErrored ? 'error' : undefined}
                css={[inputStyles, !isErrored && transparentBorderStyle]}
                value={value}
                onChange={onChange}
                placeholder="Bond"
                size="large"
                min={0}
                suffix={<Logo css={inputSuffixIconStyle} />}
              />
            </Flex>
          );
        }}
      />
    </Flex>
  );
}

function SlashFooter({ value, target }: { value?: number; target: EthosUserTarget }) {
  const subject = useActor(target);

  return (
    <Flex justify="space-between" align="center" css={[footerContainerStyle, footerPaddingStyle]}>
      <Flex gap={tokenCssVars.marginXS} align="center">
        <UserAvatar size="small" actor={subject} />
        <Typography.Text type="secondary">
          If slashing vote is successful, their score will change
        </Typography.Text>
      </Flex>
      {value && (
        <div css={[scoreDisplayStyle, scoreDisplayPaddingStyle]}>
          <ScoreDifference score={value} impact={ScoreImpact.NEGATIVE} animationDelay={0.4} />
        </div>
      )}
    </Flex>
  );
}

export function SlashModal({ target, isOpen, close }: Props) {
  const [displayConfirmationMessage, setDisplayConfirmationMessage] = useState(false);
  const { value: isSlashingEnabled } = useFeatureGate(featureGates.showSocialSlashing);
  const [slashType, setSlashType] = useState<SlashType>('credibilityScore');
  const { connectedActor } = useCurrentUser();

  // Get both users' scores
  const { data: targetScore } = useScore(target);
  const slasherScore = connectedActor.score;

  const maxSlashAmount = calculateMaxSlashAmount(
    slasherScore ?? undefined,
    targetScore ?? undefined,
  );

  const form = useForm<FormInputs<number>>({
    reValidateMode: 'onSubmit',
    defaultValues: { title: '', description: '', value: undefined },
  });

  function closeModal(): void {
    form.reset();
    setDisplayConfirmationMessage(false);
    close(false);
  }

  async function onSubmit(data: FormInputs<number>): Promise<void> {
    const errors: string[] = [];

    if (!data.title) {
      errors.push(ERROR_MESSAGES.title);
      form.setError('title', { type: 'required', message: ERROR_MESSAGES.title });
    }

    if (!data.value) {
      errors.push(ERROR_MESSAGES.score);
      form.setError('value', { type: 'required', message: ERROR_MESSAGES.score });
    }

    const roundedValue = Math.round(data.value || 0);
    const roundedMax = Math.round(maxSlashAmount);

    if (data.value && roundedValue > roundedMax) {
      errors.push(`The max amount slashable is ${roundedMax}`);
      form.setError('value', {
        type: 'manual',
        message: `The max amount slashable is ${roundedMax}`,
      });
    }

    if (errors.length > 0) {
      return;
    }

    if (!isSlashingEnabled) {
      return;
    }

    // TODO: Call slashing
    close(true);
  }

  const slashTypeSelector = (
    <Flex css={slashTypeSelectorStyle}>
      <Flex css={slashTypeSelectorInnerStyle}>
        <Segmented<SlashType>
          options={[
            {
              label: (
                <div>
                  <Logo /> Credibility score
                </div>
              ),
              value: 'credibilityScore',
            },
            {
              label: (
                <div>
                  <Ethereum /> Financial (soon)
                </div>
              ),
              value: 'financial',
              disabled: true,
            },
          ]}
          value={slashType}
          onChange={(value) => {
            setSlashType(value);
          }}
        />
      </Flex>
    </Flex>
  );

  return (
    <Modal
      open={isOpen}
      onOk={closeModal}
      onCancel={closeModal}
      maskClosable={false}
      destroyOnClose
      footer={false}
      css={displayConfirmationMessage ? modalContentStyle : modalContentDefaultStyle}
    >
      {displayConfirmationMessage ? (
        <div>Confirmation message</div>
      ) : (
        <FormProvider {...form}>
          <UserActionModal
            type={SLASH_ACTIVITY as any}
            title="Slash."
            target={target}
            isSubmitting={form.formState.isSubmitting}
            form={form}
            handleSubmit={form.handleSubmit(onSubmit)}
            customInputBlock={slashTypeSelector}
            actionComponent={<SlashAction maxAmount={maxSlashAmount} />}
            customFooter={<SlashFooter value={form.watch('value')} target={target} />}
          />
        </FormProvider>
      )}
    </Modal>
  );
}
