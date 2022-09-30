import { Container } from '@nextui-org/react';
import Head from 'next/head';
import { Content, Header } from '@components';
import { fullTitle } from '@utils';
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
          <section>
            <article>
              <div>
                <h1>404 Content</h1>
              </div>
            </article>
          </section>
        </Container>
      </Content>
    </>
  </>
);

export default FourOhFour;
