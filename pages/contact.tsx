import { Container } from '@nextui-org/react';
import { InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';
import { Content, Header } from '@components/content';
import { ContactForm } from '@components/form';
import { usePortfolioState } from '@state/context';
import { getServerSideProps } from '@utils/common';
import { fullTitle } from '@utils/head';
import type { NextPage } from 'next';

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
        <meta
          content='Get in touch to have a chat'
          key='pageDescription'
          name='description'
        />
        <meta
          content='contact chat message'
          key='pageKeywords'
          name='keywords'
        />
      </Head>
      <>
        <Header>
          Get in touch<span>contact me to have a chat</span>
        </Header>
        <Content>
          <Container>
            <ContactForm />
          </Container>
        </Content>
      </>
    </>
  );
};

export { getServerSideProps } from '@utils/common';

export default Contact;
