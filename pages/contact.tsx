import { Container, Text } from '@nextui-org/react';
import Head from 'next/head';
import { Content, Header } from '@components';
import { fullTitle } from '@utils';
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
          <Text h1>Contact content</Text>
        </Container>
      </Content>
    </>
  </>
);

export default Contact;
