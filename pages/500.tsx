import Head from 'next/head';
import { useEffect } from 'react';
import { Header } from '@components/content';
import { ErrorContent } from '@components/shared';
import { usePortfolioState } from '@state/context';
import { fullTitle } from '@utils/head';
import type { NextPage } from 'next';

const FourOhFour: NextPage = (): JSX.Element => {
  const { dispatch } = usePortfolioState();

  useEffect(() => {
    dispatch({
      payload: {
        imgId: 'BBCcHOpxyJK',
      },
      type: 'set-ig-img-id',
    });
  }, [dispatch]);

  return (
    <>
      <Head>
        <title key='pageTitle'>{fullTitle('Server error')}</title>
        <meta content='noindex, nofollow' name='robots' />
      </Head>
      <>
        <Header>
          500<span>technical blunder</span>
        </Header>
        <ErrorContent
          errorHeading='That wasn’t meant to happen'
          message='If the nearby shamrock button doesn’t get you out of here, please try again later.'
        />
      </>
    </>
  );
};

export default FourOhFour;
