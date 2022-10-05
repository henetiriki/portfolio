import { Container, Text } from '@nextui-org/react';
import Head from 'next/head';
import { Content, Header } from '@components/content';
import { fullTitle } from '@utils/head';
import type { NextPage } from 'next';

const FourOhFour: NextPage = (): JSX.Element => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('Page not found')}</title>
    </Head>
    <>
      <Header>
        four-o-four<span>wherefore art thou</span>
      </Header>
      <Content>
        <Container>
          <Text h1>404 Content</Text>
        </Container>
      </Content>
    </>
  </>
);

export default FourOhFour;
