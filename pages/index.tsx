import { Container, Link, Spacer, Text } from '@nextui-org/react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Content } from '@components/content';
import { openSourceContrs } from '@fixtures/home';
import { useImgSetup } from '@hooks';
import { aboutContainer, imageContainer } from '@styles/home';
import { blurDataURL } from '@utils/common';
import type { getStaticProps } from '@utils/common';
import type { InferGetStaticPropsType, NextPage } from 'next';

const DynamicTypeAnimation = dynamic(
  () => import('react-type-animation').then(mod => mod.TypeAnimation),
  { ssr: false }
);

const Home: NextPage = ({
  data,
}: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element => {
  useImgSetup(data);

  return (
    <>
      <Container
        as='section'
        css={{
          dflex: 'center',
          h: '85vh',
          zIndex: 1,
        }}>
        <Container css={{ ta: 'center' }}>
          <Text h1>Louw Swart</Text>
          <Text css={{ span: { color: '$shamrock' } }} h4>
            I’m a{' '}
            <DynamicTypeAnimation
              repeat={Infinity}
              sequence={[
                'front-end engineer',
                1000,
                'photographer',
                1000,
                'cat parent',
                1000,
                'plane spotter',
                1000,
                'traveller',
                1000,
              ]}
              speed={20}
              wrapper='span'
            />
          </Text>
          <Text>ex-flight attendant turned programmer</Text>
        </Container>
      </Container>
      <Content>
        <Container css={aboutContainer}>
          <Container as='div' css={{ jc: 'left' }}>
            <Text h2>About me</Text>
            <Spacer y={1} />
            <Text h3>Louw Swart</Text>
            <Text h4>Front-end Engineer, Wellington NZ</Text>
            <Spacer y={1} />
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
          <Container as='div' css={imageContainer}>
            <Image
              alt='Louw Swart'
              blurDataURL={blurDataURL(350, 350)}
              height={350}
              placeholder='blur'
              src='/images/about/louw.swart.jpg'
              width={350}
            />
          </Container>
        </Container>
      </Content>
    </>
  );
};

export { getStaticProps } from '@utils/common';

export default Home;
