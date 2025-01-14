import { LineChartOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';

export function ChartSkeleton() {
  return (
    <div className="px-4 py-4 w-full h-full">
      <Skeleton.Node active className="h-full w-full text-5xl">
        <LineChartOutlined />
      </Skeleton.Node>
    </div>
  );
}
