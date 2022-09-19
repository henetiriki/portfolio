import Head from 'next/head';
import { fullTitle } from '@utils';
import type { NextPage } from 'next';

const Contact: NextPage = () => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('Contact')}</title>
    </Head>
    <section>
      <article>
        <div>
          <h1>Contact content</h1>
        </div>
      </article>
    </section>
  </>
);

export default Contact;
