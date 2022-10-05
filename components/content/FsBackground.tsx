import { Container } from '@nextui-org/react';
import getConfig from 'next/config';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC } from 'react';
import { useIgImgId, useWindowSize } from '@hooks';
import { blurDataURL } from '@utils/common';

const { publicRuntimeConfig } = getConfig();

export const FsBackground: FC = () => {
  const router = useRouter();
  const igImgId = useIgImgId(router);
  const { height = 1920, width = 1080 } = useWindowSize();

  return (
    <Container
      css={{
        minHeight: '100vh',
        minWidth: '100vw',
        ov: 'hidden',
        position: 'fixed',
        zIndex: -1,
      }}>
      {igImgId && (
        <Image
          alt=''
          blurDataURL={blurDataURL(width, height)}
          layout='fill'
          objectFit='cover'
          placeholder='blur'
          priority={true}
          quality={100}
          src={`${publicRuntimeConfig.imgHost}/${igImgId}.jpg`}
        />
      )}
    </Container>
  );
};
