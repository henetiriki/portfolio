import { Container } from '@nextui-org/react';
import getConfig from 'next/config';
import Image from 'next/image';
import { FC, MutableRefObject, useEffect, useRef } from 'react';
import { useIgImgId, useWindowSize } from '@hooks';
import { usePortfolioState } from '@state/context';
import { blurDataURL } from '@utils/common';

const { publicRuntimeConfig } = getConfig();

export const FixedBackground: FC = () => {
  const {
    dispatch,
    state: {
      shared: { pageTopRef },
    },
  } = usePortfolioState();
  const ref = useRef() as MutableRefObject<HTMLDivElement>;
  const igImgId = useIgImgId();
  const { height = 1920, width = 1080 } = useWindowSize();

  useEffect(() => {
    if (!pageTopRef) {
      dispatch({
        payload: { pageTopRef: ref },
        type: 'set-page-top-ref',
      });
    }
  }, [pageTopRef, ref, dispatch]);

  return (
    <div ref={pageTopRef}>
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
    </div>
  );
};
