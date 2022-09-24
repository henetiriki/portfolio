import Head from 'next/head';
import { jobs } from '@fixtures';
import { fullTitle } from '@utils';
import type { NextPage } from 'next';

const Experience: NextPage = () => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('Experience')}</title>
    </Head>
    {jobs.map(({ content, institution: { name } }, idx) => (
      <div key={idx}>
        <h1>{name}</h1>
        {content}
      </div>
    ))}
  </>
);

export default Experience;
