import { Title } from '@mantine/core';
import dynamic from 'next/dynamic';
import { Content, Header } from '@components/content';
import { Seo } from '@components/shared';
import { Legend, MapLoader } from '@components/travel';
import { description } from '@fixtures/travel';
import type { NextPage } from 'next';
import type { JSX } from 'react';

const DynamicMapWrapper = dynamic(
  () => import('@components/travel').then(mod => mod.MapWrapper),
  {
    loading: () => <MapLoader />,
    ssr: false,
  }
);

const Travel: NextPage = (): JSX.Element => (
  <>
    <Seo description={description} path='/travel' title='Travel' />
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
