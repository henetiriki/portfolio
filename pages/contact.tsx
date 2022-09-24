import { Container } from '@nextui-org/react';
import Head from 'next/head';
import { fullTitle } from '@utils';
import type { NextPage } from 'next';

const Contact: NextPage = (): JSX.Element => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('Contact')}</title>
    </Head>
    <Container>
      <section>
        <article>
          <div>
            <h1>Contact content</h1>
          </div>
        </article>
      </section>
    </Container>
  </>
);

export default Contact;
