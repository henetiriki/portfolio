import { Container } from '@nextui-org/react';
import { InferGetServerSidePropsType } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useEffect } from 'react';
import { Content, Header } from '@components/content';
import { description } from '@fixtures/contact';
import { usePortfolioState } from '@state/context';
import { getServerSideProps } from '@utils/common';
import { fullTitle } from '@utils/head';
import type { NextPage } from 'next';

const DynamicContactForm = dynamic(
  () => import('@components/form').then(mod => mod.ContactForm),
  {
    ssr: false,
  }
);

const Contact: NextPage = ({
  data: { imgId },
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element => {
  const { dispatch } = usePortfolioState();

  useEffect(() => {
    dispatch({
      payload: {
        imgId,
      },
      type: 'set-ig-img-id',
    });
  }, [imgId, dispatch]);

  return (
    <>
      <Head>
        <title key='pageTitle'>{fullTitle('Contact')}</title>
        <meta content={description} key='pageDescription' name='description' />
        <meta
          content='contact chat message'
          key='pageKeywords'
          name='keywords'
        />
        <meta
          content={description}
          key='twitterDescription'
          name='twitter:description'
        />
        <meta
          content={description}
          key='ogDescription'
          property='og:description'
        />
      </Head>
      <>
        <Header>
          Get in touch<span>contact me to have a chat</span>
        </Header>
        <Content>
          <Container>
            <DynamicContactForm />
          </Container>
        </Content>
      </>
    </>
  );
};

export { getServerSideProps } from '@utils/common';

export default Contact;
