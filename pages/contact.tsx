import { Container } from '@nextui-org/react';
import Head from 'next/head';
import { ContactForm, Content, Header } from '@components';
import { fullTitle } from '@utils/head';
import type { NextPage } from 'next';

const Contact: NextPage = (): JSX.Element => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('Contact')}</title>
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

export default Contact;
