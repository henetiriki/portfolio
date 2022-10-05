import { Container, Text } from '@nextui-org/react';
import Head from 'next/head';
import { Content, Header } from '@components';
import { fullTitle } from '@utils/common';
import type { NextPage } from 'next';

const Travel: NextPage = (): JSX.Element => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('Travel')}</title>
    </Head>
    <>
      <Header>
        Places I’ve been
        <span>
          “you have brains in your head. you have feet in your shoes. you can
          steer yourself any direction you choose.” - dr. seuss
        </span>
      </Header>
      <Content>
        <Container>
          <Text h1>Travel content</Text>
        </Container>
      </Content>
    </>
  </>
);

export default Travel;
