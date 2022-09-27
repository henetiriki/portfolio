import { Container } from '@nextui-org/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';
import { useInstaImgId, useWindowSize } from '@hooks';
import { blurDataURL } from '@utils';

export const FsBackground: FC = () => {
  const { events } = useRouter();
  const { height, width } = useWindowSize();
  const [instaImgIds, nextImg] = useInstaImgId();

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
      {instaImgIds.map(instaImgId => (
        <Image
          alt=''
          blurDataURL={blurDataURL(width, height)}
          key={instaImgId}
          layout='fill'
          objectFit='cover'
          placeholder='blur'
          priority={true}
          quality={100}
          src={`${process.env.NEXT_PUBLIC_HOST}/insta/${instaImgId}.jpg`}
        />
      ))}
    </Container>
  );
};
