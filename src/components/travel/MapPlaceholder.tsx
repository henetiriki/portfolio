import Image from 'next/image';
import { staticMapUrl } from '@fixtures/travel';
import classes from './Map.module.css';
import type { FC } from 'react';

type MapPlaceholderProps = {
  rendered: boolean;
};

export const MapPlaceholder: FC<MapPlaceholderProps> = ({ rendered }) => (
  <Image
    alt=''
    className={`${classes.placeholder} ${rendered ? classes.placeholderHidden : ''}`.trim()}
    fill
    preload
    quality={85}
    sizes='100vw'
    src={staticMapUrl}
    style={{ objectFit: 'cover' }}
  />
);
