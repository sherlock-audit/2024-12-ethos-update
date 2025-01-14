import { getEnvironment } from 'config/environment';

export function TestnetMark() {
  if (getEnvironment() === 'prod') {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        position: 'absolute',
        bottom: '120px',
        fontSize: '250px',
        width: '100%',
        justifyContent: 'center',
        color: 'rgba(31,33,38, 0.05)',
        fontWeight: 600,
      }}
    >
      TESTNET
    </div>
  );
}
