import { Container, Link } from '@nextui-org/react';
import Head from 'next/head';
import { openSourceContrs } from '@fixtures';
import { fullTitle } from '@utils';
import type { NextPage } from 'next';

const About: NextPage = (): JSX.Element => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('About')}</title>
    </Head>
    <Container>
      <h1>
        ABOUT ME<span>a small introduction</span>
      </h1>
      <h2>Louw Swart</h2>
      <h4>Front-end Developer, Wellington</h4>
      <p>
        I have been in <b>Software Development</b> since 2008, with most of that
        time spent in <b>Agile environments</b>, designing, coding, testing and
        supporting applications across a <b>variety of technologies</b> and{' '}
        <b>platforms</b>.
      </p>
      <p>
        While my background is <b>Java</b>, I have been focusing my attention on{' '}
        <b>JavaScript development</b> since June 2014, working with frameworks
        such as <b>Angular</b>, <b>React</b> and <b>GraphQL</b>. My passion is
        developing for the <b>Node.js</b> runtime.
      </p>
      <p>
        I am a <b>pragmatic</b> individual with a strong{' '}
        <b>sense of responsibility</b> - I like to <b>get things done</b>.{' '}
        <b>Front-end</b> or <b>back-end</b>, I’m equally comfortable performing
        either or both.
      </p>
      <p>Open Source Contributions</p>
      <ul>
        {openSourceContrs.map(({ href, text }, idx) => (
          <li key={idx}>
            <Link
              css={{ color: '$shamrock' }}
              href={href}
              isExternal
              rel='noopener noreferrer'
              target='_blank'>
              {text}
            </Link>
          </li>
        ))}
      </ul>
      <h4>Hobbies and Interests</h4>
      <p>
        Photography, Android, travel and plane spotting - not necessarily in
        that order.
      </p>
    </Container>
  </>
);

export default About;
