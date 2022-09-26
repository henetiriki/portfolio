import { Container } from '@nextui-org/react';
import Head from 'next/head';
import { Content, Header } from '@components';
import { schools } from '@fixtures';
import { fullTitle } from '@utils';
import type { NextPage } from 'next';

const Education: NextPage = (): JSX.Element => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('Education')}</title>
    </Head>
    <>
      <Header>
        Education<span>what I’ve studied</span>
      </Header>
      <Content>
        <Container>
          {schools.map(({ content, institution: { name } }, idx) => (
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

export default Education;
