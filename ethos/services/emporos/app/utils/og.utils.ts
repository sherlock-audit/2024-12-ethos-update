import { ethosTwitterHandle } from '@ethos/domain';
import { emporosUrlMap } from '@ethos/env';
import { notEmpty } from '@ethos/helpers';
import { type MetaDescriptor } from '@remix-run/react';

export function generateOgMetadata({
  title,
  description,
  image,
}: {
  title?: string;
  description?: string;
  image?: string;
}): MetaDescriptor[] {
  return [
    title ? { title } : null,
    description ? { name: 'description', content: description } : null,
    title ? { property: 'og:title', content: title } : null,
    description ? { property: 'og:description', content: description } : null,
    image ? { property: 'og:image', content: image } : null,
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: ethosTwitterHandle },
    title ? { name: 'twitter:title', content: title } : null,
    description ? { name: 'twitter:description', content: description } : null,
    image ? { name: 'twitter:image', content: image } : null,
  ].filter(notEmpty);
}

export function getDefaultImageUrl(environment: keyof typeof emporosUrlMap) {
  return new URL('/assets/images/og/market.png', emporosUrlMap[environment]).toString();
}
