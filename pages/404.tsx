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
        imgId: 'B8S5LnGpGUn',
      },
      type: 'set-ig-img-id',
    });
  }, [dispatch]);

  return (
    <>
      <Head>
        <title key='pageTitle'>{fullTitle('Page not found')}</title>
        <meta content='noindex, nofollow' name='robots' />
      </Head>
      <>
        <Header>
          four-o-four<span>wherefore art thou</span>
        </Header>
        <ErrorContent
          errorHeading='Looks like that doesn’t exist'
          message='There should be a shamrock button somewhere nearby to get you out of here...'
        />
      </>
    </>
  );
};

export default FourOhFour;
