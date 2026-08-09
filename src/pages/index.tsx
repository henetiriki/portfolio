import { Anchor, Box, Container, Flex, Text, Title } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Content } from '@components/content';
import { openSourceContrs } from '@fixtures/home';
import { blurDataURL } from '@utils/common';
import classes from './index.module.css';
import type { NextPage } from 'next';
import type { JSX } from 'react';

const DynamicTypeAnimation = dynamic(
  () => import('react-type-animation').then(mod => mod.TypeAnimation),
  { ssr: false }
);

const Home: NextPage = (): JSX.Element => {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <Container className={classes.hero} h='75vh' pt='30vh' ta='center'>
        <Container ta='center'>
          <Title order={1} tt='uppercase'>
            Louw Swart
          </Title>
          <Title className={classes.subtitle} order={4}>
            I’m a{' '}
            {reduceMotion ? (
              <span>front-end engineer</span>
            ) : (
              <DynamicTypeAnimation
                repeat={Infinity}
                sequence={[
                  'front-end engineer',
                  1000,
                  'photographer',
                  1000,
                  'plane spotter',
                  1000,
                  'traveller',
                  1000,
                ]}
                speed={20}
                wrapper='span'
              />
            )}
          </Title>
          <Text>ex-flight attendant turned programmer</Text>
        </Container>
      </Container>
      <Content>
        <Flex
          align={{ base: 'center', md: 'flex-start' }}
          direction={{ base: 'column', md: 'row' }}
          gap='2.5rem'
          justify='space-between'>
          <Box className={classes.about}>
            <Title order={2}>About me</Title>
            <Title order={3}>Louw Swart</Title>
            <Title order={4}>Front-end Engineer, Wellington NZ</Title>
            <Text component='p'>
              I have had a varied career spanning 8 years in the travel industry
              as a <b>flight attendant</b>, after which I joined the IT sector
              in 2008, where I’ve been employed in{' '}
              <b>various software development roles</b>. These include working
              within industries such as <b>banking</b> and <b>media</b>, and for
              companies contracting services to <b>government organisations</b>.
            </Text>
            <Text component='p'>
              While my background is <b>full-stack</b> (Java), I’ve been
              specialising in <b>Front-end development</b> since 2014, working
              with frameworks such as <b>Angular</b>, <b>React</b>,{' '}
              <b>Next.js</b> and <b>GraphQL</b>.
            </Text>
            <Text component='p'>
              I am a <b>pragmatic</b> individual with a strong{' '}
              <b>sense of responsibility</b> - I like to <b>get things done</b>.
            </Text>
            <Title order={4}>Open Source Contributions</Title>
            <Box className={classes.contributions} component='ul' pl='0.75rem'>
              {openSourceContrs.map(({ href, text }, idx) => (
                <li key={idx}>
                  <Anchor
                    c='shamrock'
                    className={classes.openSourceLink}
                    href={href}
                    rel='noopener noreferrer'
                    target='_blank'>
                    {text}
                  </Anchor>
                </li>
              ))}
            </Box>
            <Title order={4}>Hobbies and Interests</Title>
            <Text component='p'>
              Photography, Android, travel and plane spotting - not necessarily
              in that order.
            </Text>
          </Box>
          <Box>
            <Box
              className={classes.profilePicture}
              maw={400}
              mt={{ base: 'xl', md: 0 }}>
              <Image
                alt='Louw Swart'
                height={350}
                placeholder={blurDataURL(350, 350)}
                src='/images/about/louw.swart.jpg'
                width={350}
              />
            </Box>
          </Box>
        </Flex>
      </Content>
    </>
  );
};

export default Home;
