import Head from 'next/head';
import { Content, Header } from '@components/content';
import { MapWrapper } from '@components/travel';

import { fullTitle } from '@utils/head';
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
      <Content wrapperPadding={{ padding: '4rem 0' }}>
        <MapWrapper />
      </Content>
    </>
  </>
);

export default Travel;
