import { Anchor, Box, Container, Flex, Text, Title } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Content } from '@components/content';
import { Seo } from '@components/shared';
import { openSourceContrs } from '@fixtures/home';
import { useArticleAgreement } from '@hooks';
import { blurDataURL } from '@utils/common';
import classes from './index.module.css';
import type { NextPage } from 'next';
import type { JSX } from 'react';

const DynamicTypeAnimation = dynamic(
  () => import('react-type-animation').then(mod => mod.TypeAnimation),
  { ssr: false }
);

const description =
  'Online portfolio and CV for Louw Swart, a front-end engineer based on the Garden Route, South Africa, working with React, Next.js and Node.js.';

const Home: NextPage = (): JSX.Element => {
  const reduceMotion = useReducedMotion();
  const [article, typeAnimationRef] = useArticleAgreement();

  return (
    <>
      <Seo description={description} path='/' title='Front-End Engineer' />
      <Container className={classes.hero} h='75vh' pt='30vh' ta='center'>
        <Container ta='center'>
          <Title order={1} tt='uppercase'>
            Louw Swart
          </Title>
          <Text fz='lg' mt='xs'>
            ex-flight attendant turned programmer
          </Text>
          <Title className={classes.subtitle} order={2} size='h4'>
            I’m {article}{' '}
            {reduceMotion ? (
              <span>front-end engineer</span>
            ) : (
              <span ref={typeAnimationRef}>
                <DynamicTypeAnimation
                  preRenderFirstString
                  repeat={Infinity}
                  sequence={[
                    'front-end engineer',
                    1000,
                    'amateur photographer',
                    1000,
                    'plane spotter',
                    1000,
                    'avid traveller',
                    1000,
                    'open-source contributor',
                    1000,
                    'Garden Route local',
                    1000,
                    'Android enthusiast',
                    1000,
                  ]}
                  speed={20}
                />
              </span>
            )}
          </Title>
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
            <Title order={3}>Front-end Engineer</Title>
            <Text c='whisper.5' fz='lg'>
              Garden Route, South Africa
            </Text>
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
                alt='Louw Swart, front-end engineer'
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
