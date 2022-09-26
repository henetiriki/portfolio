import { Container } from '@nextui-org/react';
import Head from 'next/head';
import { Content, Header } from '@components';
import { jobs } from '@fixtures';
import { fullTitle } from '@utils';
import type { NextPage } from 'next';

const Experience: NextPage = (): JSX.Element => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('Experience')}</title>
    </Head>
    <>
      <Header>
        Work experience<span>what I’ve done so far</span>
      </Header>
      <Content>
        <Container>
          {jobs.map(({ content, institution: { name } }, idx) => (
            <div key={idx}>
              <h1>{name}</h1>
              {content}
            </div>
          ))}
        </Container>
      </Content>
    </>
  </>
);

export default Experience;
