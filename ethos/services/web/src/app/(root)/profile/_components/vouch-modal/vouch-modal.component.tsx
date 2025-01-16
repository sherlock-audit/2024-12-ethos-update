import { css } from '@emotion/react';
import { type EthosUserTarget, vouchActivity } from '@ethos/domain';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from 'antd';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { zeroAddress } from 'viem';
import { useBalance } from 'wagmi';
import { cacheKeysFor, invalidate } from '../../../../../constant/queries/cache.invalidation';
import { ReviewVouchConfirmation } from '../review-vouch-confirmation/review-vouch-confirmation.component';
import { useFeesInfoForTarget } from './use-fees-info-for-target';
import { VouchAction } from './vouch-form.component';
import { calculateVouchAmounts } from './vouch-form.utils';
import { UserActionModal } from 'components/user-action-modal/user-action-modal.component';
import { type FormInputs } from 'components/user-action-modal/user-action-modal.types';
import { useCurrentUser } from 'contexts/current-user.context';
import { useVouch } from 'hooks/api/blockchain-manager';
import { type ScoreSimulationResult } from 'types/activity';
import { eventBus } from 'utils/event-bus';

type Props = {
  target: EthosUserTarget;
  isOpen: boolean;
  close: (successful: boolean) => void;
  hideConfirmation?: boolean;
};

const ERROR_MESSAGES = {
  amount: 'Vouch amount is required.',
  title: 'Your review must include a title.',
  balance: "You don't have enough funds",
};

export function VouchModal({ target, isOpen, close, hideConfirmation }: Props) {
  const queryClient = useQueryClient();
  const [displayConfirmationMessage, setDisplayConfirmationMessage] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [latestScoreSimulation, setLatestScoreSimulation] = useState<ScoreSimulationResult | null>(
    null,
  );
  const vouch = useVouch();

  const { connectedAddress } = useCurrentUser();

  const { data: balanceData } = useBalance({
    address: connectedAddress,
  });
  const fees = useFeesInfoForTarget(target);

  const balance = Number(balanceData?.formatted) ?? 0;

  const form = useForm<FormInputs<number>>({
    reValidateMode: 'onSubmit',
    defaultValues: { title: '', description: '' },
  });

  async function closeVouchModal() {
    form.reset();
    setDisplayConfirmationMessage(false);
    close(false);
  }

  // eslint-disable-next-line func-style
  const onSubmitVouch: SubmitHandler<FormInputs<number>> = async (data) => {
    const errors: string[] = [];

    if (!data.value) {
      errors.push(ERROR_MESSAGES.amount);
      form.setError('value', { type: 'required', message: ERROR_MESSAGES.amount });
    }

    if (!data.title) {
      errors.push(ERROR_MESSAGES.title);
      form.setError('title', { type: 'required', message: ERROR_MESSAGES.title });
    }

    if (typeof data.value === 'number' && data.value >= balance) {
      errors.push(ERROR_MESSAGES.balance);
      form.setError('value', { type: 'required', message: ERROR_MESSAGES.balance });
    }

    if (errors.length > 0) return;

    try {
      if (fees === undefined) return;
      const { totalAmountWithFees } = calculateVouchAmounts(data.value, fees);
      const { hash } = await vouch.mutateAsync({
        target,
        paymentAmount: totalAmountWithFees.toFixed(8),
        comment: data.title,
        metadata: { description: data?.description?.trim() },
      });
      setTransactionHash(hash);
      form.reset();
      await invalidate(
        queryClient,
        cacheKeysFor.VouchChange({ address: connectedAddress ?? zeroAddress }, target),
      );
      eventBus.emit('SCORE_UPDATED');

      if (!hideConfirmation) {
        setDisplayConfirmationMessage(true);
      } else {
        close(true);
      }
    } catch (e) {
      console.error('Failed to Vouch', e);
    }
  };

  const isVouchingInProgress = form.formState.isSubmitting;
  function onCancel() {
    if (!isVouchingInProgress) closeVouchModal();
  }

  return (
    <Modal
      open={isOpen}
      destroyOnClose
      closable={!isVouchingInProgress}
      onOk={closeVouchModal}
      onCancel={onCancel}
      maskClosable={false}
      footer={false}
      css={css`
        & .ant-modal-content {
          padding: ${displayConfirmationMessage ? 0 : null};
        }
      `}
    >
      {displayConfirmationMessage ? (
        <ReviewVouchConfirmation
          txHash={transactionHash}
          activityType={vouchActivity}
          close={closeVouchModal}
          scoreImpactSimulation={latestScoreSimulation}
        />
      ) : (
        <UserActionModal
          type="vouch"
          title="Vouch."
          target={target}
          isSubmitting={isVouchingInProgress}
          form={form}
          handleSubmit={form.handleSubmit(onSubmitVouch)}
          actionComponent={<VouchAction form={form} fees={fees} />}
          simulationChanged={(score) => {
            setLatestScoreSimulation(score);
          }}
        />
      )}
    </Modal>
  );
}
