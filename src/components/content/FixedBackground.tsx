import { Box, Container } from '@mantine/core';
import getConfig from 'next/config';
import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import { useIgImgId } from '@hooks';
import { usePortfolioState } from '@state/context';
import type { FC, MutableRefObject } from 'react';

const {
  publicRuntimeConfig: { imgHost },
} = getConfig();

export const FixedBackground: FC = () => {
  const {
    dispatch,
    state: {
      shared: { pageTopRef },
    },
  } = usePortfolioState();
  const ref = useRef() as MutableRefObject<HTMLDivElement>;
  const igImgId = useIgImgId();

  useLayoutEffect(() => {
    if (!pageTopRef) {
      dispatch({
        payload: { pageTopRef: ref },
        type: 'set-page-top-ref',
      });
    }
  }, [pageTopRef, ref, dispatch]);

  return (
    <Box ref={pageTopRef}>
      <Container
        sx={{
          minHeight: '100vh',
          minWidth: '100vw',
          overflow: 'hidden',
          position: 'fixed',
          zIndex: -1,
        }}>
        {igImgId && (
          <Image
            alt=''
            fill
            priority={true}
            quality={100}
            sizes='100vw'
            src={`${imgHost}/${igImgId}.jpg`}
            style={{
              backgroundImage: 'url(/images/blur/shimmer.svg)',
              backgroundSize: 'cover',
              objectFit: 'cover',
            }}
          />
        )}
      </Container>
    </Box>
  );
};
