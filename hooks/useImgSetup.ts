import { useEffect } from 'react';
import { usePortfolioState } from '@state/context';
import type { ImageId } from '@utils/common';

export const useImgSetup = ({ imgId }: ImageId) => {
  const { dispatch } = usePortfolioState();

  useEffect(() => {
    if (imgId) {
      dispatch({
        payload: {
          imgId,
        },
        type: 'set-ig-img-id',
      });
    }
  }, [dispatch, imgId]);
};
