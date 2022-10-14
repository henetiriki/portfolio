import { Container } from '@nextui-org/react';
import { InferGetStaticPropsType } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Content, Header } from '@components/content';
import { description } from '@fixtures/contact';
import { useImgSetup } from '@hooks';
import { getStaticProps } from '@utils/common';
import { fullTitle } from '@utils/head';
import type { NextPage } from 'next';

const DynamicContactForm = dynamic(
  () => import('@components/form').then(mod => mod.ContactForm),
  {
    ssr: false,
  }
);

const Contact: NextPage = ({
  data,
}: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element => {
  useImgSetup(data);

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

export { getStaticProps } from '@utils/common';

export default Contact;
