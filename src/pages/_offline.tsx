import Head from 'next/head';
import { useEffect } from 'react';
import { Header } from '@components/content';
import { ErrorContent } from '@components/shared';
import { usePortfolioState } from '@state/context';
import { fullTitle } from '@utils/head';
import type { NextPage } from 'next';
import type { JSX } from 'react';

const FourOhFour: NextPage = (): JSX.Element => {
  const { dispatch } = usePortfolioState();

  useEffect(() => {
    dispatch({
      payload: {
        imgId: 'BmnVe_BAMqm',
      },
      type: 'set-ig-img-id',
    });
  }, [dispatch]);

  return (
    <>
      <Head>
        <title key='pageTitle'>{fullTitle('Offline?')}</title>
        <meta content='noindex, nofollow' name='robots' />
      </Head>
      <>
        <Header>
          Offline?<span>out of range?</span>
        </Header>
        <ErrorContent
          errorHeading='You might’ve lost connectivity'
          message='There should be a shamrock button somewhere nearby to get you out of here once you’re online again...'
        />
      </>
    </>
  );
};

export default FourOhFour;
