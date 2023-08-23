import { Title } from '@mantine/core';
import getConfig from 'next/config';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Content, Header } from '@components/content';
import { Legend, MapLoader } from '@components/travel';
import { description } from '@fixtures/travel';
import { fullTitle } from '@utils/head';
import type { NextPage } from 'next';
import type { JSX } from 'react';

const DynamicMapWrapper = dynamic(
  () => import('@components/travel').then(mod => mod.MapWrapper),
  {
    loading: () => <MapLoader />,
    ssr: false,
  }
);

const {
  publicRuntimeConfig: { siteUrl },
} = getConfig();

const Travel: NextPage = (): JSX.Element => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('Travel')}</title>
      <link href={`${siteUrl}/travel`} key='canonical' rel='canonical' />
      <meta
        content='“You have brains in your head. You have feet in your shoes. You can
            steer yourself any direction you choose.” - Dr. Seuss'
        key='pageDescription'
        name='description'
      />
      <meta
        content='planes trains ferries cruise ships'
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
        Places I’ve been
        <span>
          “you have brains in your head. you have feet in your shoes. you can
          steer yourself any direction you choose.” - dr. seuss
        </span>
      </Header>
      <Content waveBottom={false}>
        <Title order={2}>Travel history</Title>
      </Content>
      <DynamicMapWrapper />
      <Content waveTop={false}>
        <Legend />
      </Content>
    </>
  </>
);

export default Travel;
