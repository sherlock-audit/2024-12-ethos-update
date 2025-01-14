import { formatDate } from '@ethos/helpers';

export function SnapshotDateOG() {
  return (
    <div tw="flex flex-col items-end absolute top-12 right-14 text-xl" style={{ gap: '4px' }}>
      <span>Snapshot from</span>
      <span>
        {formatDate(new Date(), {
          dateStyle: 'medium',
        })}
      </span>
    </div>
  );
}
