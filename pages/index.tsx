import { Anchor, Container, Text, Title } from '@mantine/core';
import dynamic from 'next/dynamic';
import Image from 'next/legacy/image';
import { Content } from '@components/content';
import { openSourceContrs } from '@fixtures/home';
import { useImgSetup } from '@hooks';
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
      <Container>
        <Container>
          <Title order={1}>Louw Swart</Title>
          <Title order={4}>
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
          </Title>
          <Text>ex-flight attendant turned programmer</Text>
        </Container>
      </Container>
      <Content>
        <div>
          <Container>
            <Container>
              <Title order={2}>About me</Title>
              <Title order={3}>Louw Swart</Title>
              <Title order={4}>Front-end Engineer, Wellington NZ</Title>
              <Text>
                I have been in <b>Software Development</b> since 2008, with most
                of that time spent in <b>Agile environments</b>, designing,
                coding, testing and supporting applications across a{' '}
                <b>variety of technologies</b> and <b>platforms</b>.
              </Text>
              <Text>
                While my background is <b>Java</b>, I have been focusing my
                attention on <b>JavaScript development</b> since June 2014,
                working with frameworks such as <b>Angular</b>, <b>React</b> and{' '}
                <b>GraphQL</b>. My passion is developing for the <b>Node.js</b>{' '}
                runtime.
              </Text>
              <Text>
                I am a <b>pragmatic</b> individual with a strong{' '}
                <b>sense of responsibility</b> - I like to{' '}
                <b>get things done</b>. <b>Front-end</b> or <b>back-end</b>, I’m
                equally comfortable performing either or both.
              </Text>
              <Title order={4}>Open Source Contributions</Title>
              <ul>
                {openSourceContrs.map(({ href, text }, idx) => (
                  <li key={idx}>
                    <Anchor
                      href={href}
                      rel='noopener noreferrer'
                      target='_blank'>
                      {text}
                    </Anchor>
                  </li>
                ))}
              </ul>
              <Title order={4}>Hobbies and Interests</Title>
              <Text>
                Photography, Android, travel and plane spotting - not
                necessarily in that order.
              </Text>
            </Container>
            <Container>
              <Image
                alt='Louw Swart'
                blurDataURL={blurDataURL(350, 350)}
                height={350}
                lazyBoundary='0px'
                placeholder='blur'
                src='/images/about/louw.swart.jpg'
                width={350}
              />
            </Container>
          </Container>
        </div>
      </Content>
    </>
  );
};

export { getStaticProps } from '@utils/common';

export default Home;
