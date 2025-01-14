import { readFileSync } from 'node:fs';
import path from 'node:path';
import { type ImageResponse } from 'next/og';

type Fonts = NonNullable<NonNullable<ConstructorParameters<typeof ImageResponse>[1]>['fonts']>;

const interFontRegular = readFileSync(path.resolve('./public/assets/fonts/Inter-Regular.ttf'));
const interFontSemiBold = readFileSync(path.resolve('./public/assets/fonts/Inter-SemiBold.ttf'));
const queensFontRegular = readFileSync(path.resolve('./public/assets/fonts/Queens-Regular.ttf'));

export function getFonts(): Fonts {
  return [
    {
      name: 'Inter',
      weight: 400,
      style: 'normal',
      data: interFontRegular,
    },
    {
      name: 'Inter',
      weight: 600,
      style: 'normal',
      data: interFontSemiBold,
    },
    {
      name: 'Queens',
      weight: 400,
      style: 'normal',
      data: queensFontRegular,
    },
  ];
}
