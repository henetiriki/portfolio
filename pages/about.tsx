import { Container, Link, Spacer, Text } from '@nextui-org/react';
import Head from 'next/head';
import Image from 'next/image';
import { Content, Header } from '@components';
import { openSourceContrs } from '@fixtures';
import { fullTitle } from '@utils/head';
import type { NextPage } from 'next';

const About: NextPage = (): JSX.Element => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('About')}</title>
    </Head>
    <>
      <Header>
        About me<span>a small introduction</span>
      </Header>
      <Content>
        <Container
          css={{
            d: 'flex',
            fd: 'column',
            fw: 'nowrap',
            /* eslint-disable sort-keys/sort-keys-fix */
            '@xs': {
              fd: 'row',
            },
            /* eslint-enable sort-keys/sort-keys-fix */
          }}>
          <Container as='div' css={{ jc: 'left' }}>
            <Text h2>Louw Swart</Text>
            <Spacer y={1} />
            <Text h4>Front-end Developer, Wellington</Text>
            <Text>
              I have been in <b>Software Development</b> since 2008, with most
              of that time spent in <b>Agile environments</b>, designing,
              coding, testing and supporting applications across a{' '}
              <b>variety of technologies</b> and <b>platforms</b>.
            </Text>
            <Text css={{ letterSpacing: 'normal' }}>
              While my background is <b>Java</b>, I have been focusing my
              attention on <b>JavaScript development</b> since June 2014,
              working with frameworks such as <b>Angular</b>, <b>React</b> and{' '}
              <b>GraphQL</b>. My passion is developing for the <b>Node.js</b>{' '}
              runtime.
            </Text>
            <Text css={{ letterSpacing: 'normal' }}>
              I am a <b>pragmatic</b> individual with a strong{' '}
              <b>sense of responsibility</b> - I like to <b>get things done</b>.{' '}
              <b>Front-end</b> or <b>back-end</b>, I’m equally comfortable
              performing either or both.
            </Text>
            <Spacer y={1.5} />
            <Text h4>Open Source Contributions</Text>
            <ul>
              {openSourceContrs.map(({ href, text }, idx) => (
                <li key={idx}>
                  <Link
                    css={{
                      color: '$shamrock',
                      letterSpacing: 'normal',
                    }}
                    href={href}
                    isExternal
                    rel='noopener noreferrer'
                    target='_blank'>
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
            <Spacer y={1.5} />
            <Text h4>Hobbies and Interests</Text>
            <Text css={{ letterSpacing: 'normal' }}>
              Photography, Android, travel and plane spotting - not necessarily
              in that order.
            </Text>
          </Container>
          <Container
            as='div'
            css={{
              '& img': {
                borderColor: '$whisper !important',
                borderStyle: 'solid  !important',
                br: '$xs',
                bw: '$xl  !important',
              },
              mt: '$3xl',
              mw: '400px',
              /* eslint-disable sort-keys/sort-keys-fix */
              '@xs': {
                mt: 0,
              },
              /* eslint-enable sort-keys/sort-keys-fix */
            }}>
            <Image
              alt='Louw Swart'
              height='350px'
              src='/images/about/louw.swart.jpg'
              width='350px'
            />
          </Container>
        </Container>
      </Content>
    </>
  </>
);

export default About;
