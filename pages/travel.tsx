import { Container } from '@nextui-org/react';
import Head from 'next/head';
import { fullTitle } from '@utils';
import type { NextPage } from 'next';

const Travel: NextPage = (): JSX.Element => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('Travel')}</title>
    </Head>
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
);

export default Travel;
