import Head from 'next/head';
import { fullTitle } from '@utils';
import type { NextPage } from 'next';

const Travel: NextPage = () => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('Travel')}</title>
    </Head>
    <section>
      <article>
        <div>
          <h1>Travel content</h1>
        </div>
      </article>
    </section>
  </>
);

export default Travel;
