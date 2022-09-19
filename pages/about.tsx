import Head from 'next/head';
import { openSourceContrs } from '@fixtures';
import { fullTitle } from '@utils';
import type { NextPage } from 'next';

const About: NextPage = () => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('About')}</title>
    </Head>
    <h1>
      ABOUT ME<span>a small introduction</span>
    </h1>
    <h2>Louw Swart</h2>
    <h4>Front-end Developer, Wellington</h4>
    <p>
      I have been in Software Development since 2008, with most of that time
      spent in Agile environments, designing, coding, testing and supporting
      applications across a variety of technologies and platforms.
    </p>
    <p>
      While my background is Java, I have been focusing my attention on
      JavaScript development since June 2014, working with frameworks such as
      Angular, React and GraphQL. My passion is developing for the Node.js
      runtime.
    </p>
    <p>
      I have a strong sense of responsibility and am always driven to deliver on
      or ahead of deadlines. Front-end or back-end, I’m equally comfortable
      performing either or both.
    </p>
    <p>Open Source Contributions</p>
    <ul>
      {openSourceContrs.map(({ href, text }, idx) => (
        <li key={idx}>
          <a href={href} rel='noopener noreferrer' target='_blank'>
            {text}
          </a>
        </li>
      ))}
    </ul>
    <h4>Hobbies and Interests</h4>
    <p>
      Photography, Android, travel and plane spotting - not necessarily in that
      order.
    </p>
  </>
);

export default About;
