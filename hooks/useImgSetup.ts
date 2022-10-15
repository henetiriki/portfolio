import { useEffect } from 'react';
import useSWR from 'swr';
import { usePortfolioState } from '@state/context';
import { fetcher } from '@utils/common';
import type { ImageId } from '@utils/common';

export const useImgSetup = ({ imgId: fallbackImgId }: ImageId) => {
  const { dispatch } = usePortfolioState();
  const { data: { imgId } = {}, error } = useSWR<ImageId>(
    '/api/img-id',
    fetcher
  );

  useEffect(() => {
    if (error) {
      dispatch({
        payload: {
          imgId: fallbackImgId,
        },
        type: 'set-ig-img-id',
      });
    }
  }, [dispatch, error, fallbackImgId]);

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
