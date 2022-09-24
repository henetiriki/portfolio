import { Container } from '@nextui-org/react';
import Head from 'next/head';
import { schools } from '@fixtures';
import { fullTitle } from '@utils';
import type { NextPage } from 'next';

const Education: NextPage = (): JSX.Element => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('Education')}</title>
    </Head>
    <Container>
      {schools.map(({ content, institution: { name } }, idx) => (
        <div key={idx}>
          <h1>{name}</h1>
          {content}
        </div>
      ))}
    </Container>
  </>
);

export default Education;
