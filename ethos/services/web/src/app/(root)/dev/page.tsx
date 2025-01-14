'use client';
import { Tabs, type TabsProps } from 'antd';
import { notFound, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Claim } from './_components/claim.component';
import { ColorsList } from './_components/colors-list.component';
import { DebugUser } from './_components/debug-user.component';
import { isDevPageEnabled } from './_components/dev-page.utils';
import { IconList } from './_components/icon-list.component';
import { Notifications } from './_components/notifications.component';
import { TwitterUser } from './_components/twitter-user.component';
import { BasicPageWrapper } from 'components/basic-page-wrapper/basic-page-wrapper.component';

const items: NonNullable<TabsProps['items']> = [
  {
    key: 'icons',
    label: 'Icons',
    children: <IconList />,
  },
  {
    key: 'colors',
    label: 'Colors',
    children: <ColorsList />,
  },
  {
    key: 'notifications',
    label: 'Debug notifications',
    children: <Notifications />,
  },
  {
    key: 'debug-user',
    label: 'Debug user',
    children: <DebugUser />,
  },
  {
    key: 'claim',
    label: 'Claim',
    children: <Claim />,
  },
  {
    key: 'twitter-user',
    label: 'Twitter user',
    children: <TwitterUser />,
  },
];

export default function DevPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!isDevPageEnabled()) {
    return notFound();
  }

  return (
    <BasicPageWrapper title="Dev">
      <Tabs
        activeKey={searchParams.get('tab') ?? items[0].key}
        items={items}
        onChange={(key) => {
          router.push(`${pathname}?tab=${key}`);
        }}
      />
    </BasicPageWrapper>
  );
}
