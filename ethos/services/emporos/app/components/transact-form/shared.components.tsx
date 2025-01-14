import { Segmented, type SegmentedProps } from 'antd';
import { ThumbsDownOutlinedIcon, ThumbsUpOutlinedIcon } from '../icons/thumbs.tsx';
import { useTransactionForm } from '~/routes/market.$id/transaction-context.tsx';

export function TrustButtons() {
  const { state, setState } = useTransactionForm();
  const { market } = state;
  const options: SegmentedProps['options'] = [
    {
      label: (
        <span className="text-trust text-xs/none">
          <ThumbsUpOutlinedIcon /> Trust {Math.round(market.trustPercentage)}%
        </span>
      ),
      value: 'trust',
    },
    {
      label: (
        <span className="text-distrust text-xs/none">
          <ThumbsDownOutlinedIcon /> Distrust {Math.round(100 - market.trustPercentage)}%
        </span>
      ),
      value: 'distrust',
    },
  ];

  return (
    <Segmented
      options={options}
      block
      size="middle"
      value={state.voteType}
      onChange={(value) => {
        setState({ voteType: value as 'trust' | 'distrust' });
      }}
    />
  );
}
