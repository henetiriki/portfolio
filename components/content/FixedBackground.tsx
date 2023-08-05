import { Container, createStyles } from '@mantine/core';
import getConfig from 'next/config';
import Image from 'next/legacy/image';
import { useLayoutEffect, useRef } from 'react';
import { useIgImgId, useWindowSize } from '@hooks';
import { usePortfolioState } from '@state/context';
import { blurDataURL } from '@utils/common';
import type { FC, MutableRefObject } from 'react';

const {
  publicRuntimeConfig: { imgHost },
} = getConfig();

const useFixedBackgroundStyles = createStyles({
  fixedBg: {
    minHeight: '100vh',
    minWidth: '100vw',
    overflow: 'hidden',
    position: 'fixed',
    zIndex: -1,
  },
});

export const FixedBackground: FC = () => {
  const {
    dispatch,
    state: {
      shared: { pageTopRef },
    },
  } = usePortfolioState();
  const {
    classes: { fixedBg },
  } = useFixedBackgroundStyles();
  const ref = useRef() as MutableRefObject<HTMLDivElement>;
  const igImgId = useIgImgId();
  const { height = 1920, width = 1080 } = useWindowSize();

  useLayoutEffect(() => {
    if (!pageTopRef) {
      dispatch({
        payload: { pageTopRef: ref },
        type: 'set-page-top-ref',
      });
    }
  }, [pageTopRef, ref, dispatch]);

  return (
    <div ref={pageTopRef}>
      <Container className={fixedBg}>
        {igImgId && (
          <Image
            alt=''
            blurDataURL={blurDataURL(width, height)}
            layout='fill'
            objectFit='cover'
            placeholder='blur'
            priority={true}
            quality={100}
            src={`${imgHost}/${igImgId}.jpg`}
          />
        )}
      </Container>
    </div>
  );
};
