import { Container } from '@nextui-org/react';
import Head from 'next/head';
import { Header } from '@components';
import { fullTitle } from '@utils';
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
      <Container>
        <section>
          <article>
            <div>
              <h1>Travel content</h1>
            </div>
          </article>
        </section>
      </Container>
    </>
  </>
);

export default Travel;
