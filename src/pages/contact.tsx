import Head from 'next/head';
import { Content, Header } from '@components/content';
import { ContactForm } from '@components/form';
import { description } from '@fixtures/contact';
import { fullTitle } from '@utils/head';
import type { NextPage } from 'next';
import type { JSX } from 'react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

const Contact: NextPage = (): JSX.Element => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('Contact')}</title>
      <link href={`${siteUrl}/contact`} key='canonical' rel='canonical' />
      <meta content={description} key='pageDescription' name='description' />
      <meta content='contact chat message' key='pageKeywords' name='keywords' />
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
        <ContactForm />
      </Content>
    </>
  </>
);

export default Contact;
