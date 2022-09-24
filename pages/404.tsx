import Head from 'next/head';
import { fullTitle } from '@utils';
import type { NextPage } from 'next';

const FourOhFour: NextPage = (): JSX.Element => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('Page not found')}</title>
    </Head>
    <section>
      <article>
        <div>
          <h1>404 content</h1>
        </div>
      </article>
    </section>
  </>
);

export default FourOhFour;
