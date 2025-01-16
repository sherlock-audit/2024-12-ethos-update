import { Button, Card } from 'antd';
import { useResetClaim } from 'hooks/api/echo.hooks';

export function Claim() {
  const resetClaim = useResetClaim();

  return (
    <Card>
      <Button
        variant="filled"
        color="danger"
        onClick={() => {
          resetClaim.mutate();
        }}
        loading={resetClaim.isPending}
      >
        Reset claim
      </Button>
    </Card>
  );
}
