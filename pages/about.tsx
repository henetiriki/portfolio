import { Container, Image, Link, Text } from '@nextui-org/react';
import Head from 'next/head';
import { openSourceContrs } from '@fixtures';
import { fullTitle } from '@utils';
import type { NextPage } from 'next';

const About: NextPage = (): JSX.Element => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('About')}</title>
    </Head>
    <Container
      as='div'
      css={{
        backgroundColor: '$valhalla',
        clear: 'both',
        flexWrap: 'nowrap',
        margin: '40vh auto 10rem',
        minWidth: '100vw',
        padding: '8rem 0 12rem',
        position: 'absolute',
      }}>
      <Text as='h1'>
        ABOUT ME<span>a small introduction</span>
      </Text>
      <Container
        css={{
          '@xs': {
            flexDirection: 'row',
          },
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
        }}>
        <Container as='div' css={{ maxWidth: '400px' }}>
          <Image
            alt='Louw Swart'
            autoResize
            css={{
              borderColor: '$whisper',
              borderRadius: '$xs',
              borderStyle: 'solid',
              borderWidth: '$xl',
              height: 'auto',
            }}
            height='350px'
            showSkeleton
            src='/images/about/louw.swart.jpg'
            width='350px'
          />
        </Container>
        <Container as='div'>
          <Text as='h2'>Louw Swart</Text>
          <Text as='h4'>Front-end Developer, Wellington</Text>
          <Text>
            I have been in <b>Software Development</b> since 2008, with most of
            that time spent in <b>Agile environments</b>, designing, coding,
            testing and supporting applications across a{' '}
            <b>variety of technologies</b> and <b>platforms</b>.
          </Text>
          <Text>
            While my background is <b>Java</b>, I have been focusing my
            attention on <b>JavaScript development</b> since June 2014, working
            with frameworks such as <b>Angular</b>, <b>React</b> and{' '}
            <b>GraphQL</b>. My passion is developing for the <b>Node.js</b>{' '}
            runtime.
          </Text>
          <Text>
            I am a <b>pragmatic</b> individual with a strong{' '}
            <b>sense of responsibility</b> - I like to <b>get things done</b>.{' '}
            <b>Front-end</b> or <b>back-end</b>, I’m equally comfortable
            performing either or both.
          </Text>
          <Text>Open Source Contributions</Text>
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
          <Text as='h4'>Hobbies and Interests</Text>
          <Text>
            Photography, Android, travel and plane spotting - not necessarily in
            that order.
          </Text>
        </Container>
      </Container>
    </Container>
  </>
);

export default About;
