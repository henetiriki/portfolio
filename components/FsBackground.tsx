import { Container } from '@nextui-org/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';
import { useIgImgId, useWindowSize } from '@hooks';
import { blurDataURL } from '@utils';

export const FsBackground: FC = () => {
  const { events } = useRouter();
  const { height, width } = useWindowSize();
  const { igImageIds, nextImg } = useIgImgId();

  useEffect(() => {
    events.on('routeChangeComplete', () => {
      nextImg();
    });
  }, [events, nextImg]);

  return (
    <Container
      css={{
        minHeight: '100vh',
        minWidth: '100vw',
        overflow: 'hidden',
        position: 'fixed',
        zIndex: -1,
      }}>
      {igImageIds.map(igImgId => (
        <Image
          alt=''
          blurDataURL={blurDataURL(width, height)}
          key={igImgId}
          layout='fill'
          objectFit='cover'
          placeholder='blur'
          priority={true}
          quality={100}
          src={`/api/ig/${igImgId}.jpg`}
        />
      ))}
    </Container>
  );
};
