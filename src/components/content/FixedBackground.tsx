import { Box, Container } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import { useIgImgId } from '@hooks';
import { usePortfolioState } from '@state/context';
import { blurDataURL } from '@utils/common';
import classes from './FixedBackground.module.css';
import type { FC } from 'react';

const imgHost = process.env.NEXT_PUBLIC_IMAGE_HOST;

export const FixedBackground: FC = () => {
  const {
    dispatch,
    state: {
      shared: { pageTopRef },
    },
  } = usePortfolioState();
  const ref = useRef<HTMLDivElement>(null);
  const igImgId = useIgImgId();
  const { height, width } = useViewportSize();

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
        className={classes.container}
        mih='100vh'
        miw='100vw'
        pos='fixed'>
        {igImgId && (
          <Image
            alt=''
            fill
            placeholder={blurDataURL(width || 1080, height || 1920)}
            priority={true}
            quality={100}
            sizes='100vw'
            src={`${imgHost}/${igImgId}.jpg`}
            style={{ objectFit: 'cover' }}
          />
        )}
      </Container>
    </Box>
  );
};
