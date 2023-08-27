import { Anchor, Box, Container, Flex, Text, Title } from '@mantine/core';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Content } from '@components/content';
import { openSourceContrs } from '@fixtures/home';
import type { MantineTheme } from '@mantine/core';
import type { NextPage } from 'next';
import type { JSX } from 'react';

const DynamicTypeAnimation = dynamic(
  () => import('react-type-animation').then(mod => mod.TypeAnimation),
  { ssr: false }
);

const Home: NextPage = (): JSX.Element => (
  <>
    <Container
      sx={{
        alignItems: 'center',
        display: 'flex',
        height: '75vh',
        justifyContent: 'center',
        zIndex: 1,
      }}>
      <Container sx={{ textAlign: 'center' }}>
        <Title order={1}>Louw Swart</Title>
        <Title
          order={4}
          sx={({ colors: { shamrock } }: MantineTheme) => ({
            span: {
              color: shamrock[4],
            },
          })}>
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
      <Flex
        align={{ base: 'center', md: 'flex-start' }}
        direction={{ base: 'column', md: 'row' }}
        gap='2.5rem'
        justify='space-between'>
        <Box sx={{ flexBasis: '50%' }}>
          <Title order={2}>About me</Title>
          <Title order={3}>Louw Swart</Title>
          <Title order={4}>Front-end Engineer, Wellington NZ</Title>
          <Text component='p'>
            I have been in <b>Software Development</b> since 2008, with most of
            that time spent in <b>Agile environments</b>, designing, coding,
            testing and supporting applications across a{' '}
            <b>variety of technologies</b> and <b>platforms</b>.
          </Text>
          <Text component='p'>
            While my background is <b>Java</b>, I have been focusing my
            attention on <b>JavaScript development</b> since June 2014, working
            with frameworks such as <b>Angular</b>, <b>React</b> and{' '}
            <b>GraphQL</b>. My passion is developing for the <b>Node.js</b>{' '}
            runtime.
          </Text>
          <Text component='p'>
            I am a <b>pragmatic</b> individual with a strong{' '}
            <b>sense of responsibility</b> - I like to <b>get things done</b>.{' '}
            <b>Front-end</b> or <b>back-end</b>, I’m equally comfortable
            performing either or both.
          </Text>
          <Title order={4}>Open Source Contributions</Title>
          <Box
            component='ul'
            sx={{ listStyleType: 'none', paddingLeft: '0.75rem' }}>
            {openSourceContrs.map(({ href, text }, idx) => (
              <li key={idx}>
                <Anchor
                  color='shamrock'
                  href={href}
                  rel='noopener noreferrer'
                  sx={{
                    '&:hover': {
                      textDecoration: 'none',
                    },
                  }}
                  target='_blank'>
                  {text}
                </Anchor>
              </li>
            ))}
          </Box>
          <Title order={4}>Hobbies and Interests</Title>
          <Text component='p'>
            Photography, Android, travel and plane spotting - not necessarily in
            that order.
          </Text>
        </Box>
        <Box>
          <Box
            id='XXXXX'
            maw={400}
            mt={{ base: 'xl', md: 0 }}
            sx={({ colors: { whisper } }: MantineTheme) => ({
              '& img': {
                borderColor: `${whisper[4]} !important`,
                borderRadius: '0.5rem',
                borderStyle: 'solid !important',
                borderWidth: '0.25rem !important',
              },
            })}>
            <Image
              alt='Louw Swart'
              height={350}
              src='/images/about/louw.swart.jpg'
              style={{
                backgroundImage: 'url(/images/blur/shimmer.svg)',
                backgroundSize: 'cover',
                height: 'auto',
                maxWidth: '100%',
              }}
              width={350}
            />
          </Box>
        </Box>
      </Flex>
    </Content>
  </>
);

export default Home;
