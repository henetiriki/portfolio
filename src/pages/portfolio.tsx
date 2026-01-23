import { Anchor, Box, Container, Text, Title } from '@mantine/core';
import getConfig from 'next/config';
import Head from 'next/head';
import Image from 'next/legacy/image';
import NextLink from 'next/link';
import { Content, Header } from '@components/content';
import { description } from '@fixtures/portfolio';
import { blurDataURL } from '@utils/common';

import { fullTitle } from '@utils/head';
import type { MantineTheme } from '@mantine/core';
import type { NextPage } from 'next';
import type { JSX } from 'react';

const {
  publicRuntimeConfig: { siteUrl },
} = getConfig();

const Portfolio: NextPage = (): JSX.Element => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('Portfolio')}</title>
      <link href={`${siteUrl}/experience`} key='canonical' rel='canonical' />
      <meta content={description} key='pageDescription' name='description' />
      <meta
        content='portfolio freelance squarespace'
        key='pageKeywords'
        name='keywords'
      />
      <meta
        content={description}
        key='twitterDescription'
        name='twitter:description'
      />
      <meta
        content={description}
        key='ogDescription'
        property='og:description'
      />
    </Head>
    <>
      <Header>
        Portfolio<span>freelance work I’ve done</span>
      </Header>
      <Content>
        <Container
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            marginLeft: '-15px',
            marginRight: '-15px',
          }}>
          <Container
            sx={({ fn: { largerThan } }: MantineTheme) => ({
              marginBottom: '30px',
              paddingLeft: '15px',
              paddingRight: '15px',
              position: 'relative',
              [largerThan('sm')]: {
                flex: '0 0 50%',
                maxWidth: '50%',
              },
              [largerThan('md')]: {
                flex: '0 0 33.333333%',
                maxWidth: '33.333333%',
              },
              width: '100%',
            })}>
            <Box
              sx={{
                color: 'white',
                height: '192px',
                padding: 0,
                position: 'relative',
                width: 'auto',
              }}>
              <Image
                alt='Louw Swart'
                blurDataURL={blurDataURL(350, 192)}
                layout='fill'
                lazyBoundary='0px'
                objectFit='cover'
                placeholder='blur'
                src='/images/portfolio/www.beautywithin.au.jpg'
              />
            </Box>
            <Box
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '15px',
              }}>
              <Title order={3}>
                <Anchor
                  c='shamrock'
                  href='https://www.beautywithin.au/'
                  rel='noopener noreferrer'
                  sx={({ colors: { shamrock } }: MantineTheme) => ({
                    '&:hover': {
                      color: shamrock[5],
                      textDecoration: 'none',
                    },
                    span: {
                      fontSize: '0.75rem',
                      fontStyle: 'italic',
                    },
                  })}
                  target='_blank'>
                  Beauty WithIn
                </Anchor>
              </Title>
              <Text component='p'>
                <b>Squarespace + Acuity Integration</b>
                <br />
                <br />A sophisticated web design for a Registered Nurse-led
                clinic based in Brisbane, Australia. I implemented a custom
                <i>Squarespace</i> layout and paired it with{' '}
                <i>Acuity Scheduling</i> engine to manage aesthetic
                consultations, deposit payments, and automated client workflows.
              </Text>
            </Box>
          </Container>
          <Container
            sx={({ fn: { largerThan } }: MantineTheme) => ({
              marginBottom: '30px',
              paddingLeft: '15px',
              paddingRight: '15px',
              position: 'relative',
              [largerThan('sm')]: {
                flex: '0 0 50%',
                maxWidth: '50%',
              },
              [largerThan('md')]: {
                flex: '0 0 33.333333%',
                maxWidth: '33.333333%',
              },
              width: '100%',
            })}>
            <Box
              sx={{
                color: 'white',
                height: '192px',
                padding: 0,
                position: 'relative',
                width: 'auto',
              }}>
              <Image
                alt='Louw Swart'
                blurDataURL={blurDataURL(350, 192)}
                layout='fill'
                lazyBoundary='0px'
                objectFit='cover'
                placeholder='blur'
                src='/images/portfolio/www.csarc.co.za.jpg'
              />
            </Box>
            <Box
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '15px',
              }}>
              <Title order={3}>
                <Anchor
                  c='shamrock'
                  href='https://www.csarc.co.za/'
                  rel='noopener noreferrer'
                  sx={({ colors: { shamrock } }: MantineTheme) => ({
                    '&:hover': {
                      color: shamrock[5],
                      textDecoration: 'none',
                    },
                    span: {
                      fontSize: '0.75rem',
                      fontStyle: 'italic',
                    },
                  })}
                  target='_blank'>
                  CSA Architects
                </Anchor>
              </Title>
              <Text component='p'>
                <b>Minimalist Squarespace Build</b>
                <br />
                <br />A sophisticated digital portfolio for a Western Cape
                architecture firm. Using Squarespace, I built a clean,
                responsive interface that balances project portfolios with
                technical service descriptions. The result is a high-end,
                functional site that aligns with the client’s brand of
                “simplistic and smart design”.
              </Text>
            </Box>
          </Container>
          <Container
            sx={({ fn: { largerThan } }: MantineTheme) => ({
              marginBottom: '30px',
              paddingLeft: '15px',
              paddingRight: '15px',
              position: 'relative',
              [largerThan('sm')]: {
                flex: '0 0 50%',
                maxWidth: '50%',
              },
              [largerThan('md')]: {
                flex: '0 0 33.333333%',
                maxWidth: '33.333333%',
              },
              width: '100%',
            })}>
            <Box
              sx={{
                color: 'white',
                height: '192px',
                padding: 0,
                position: 'relative',
                width: 'auto',
              }}>
              <Image
                alt='Louw Swart'
                blurDataURL={blurDataURL(350, 192)}
                layout='fill'
                lazyBoundary='0px'
                objectFit='cover'
                placeholder='blur'
                src='/images/portfolio/coming_soon.jpg'
              />
            </Box>
            <Box
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '15px',
              }}>
              <Title order={3}>
                <Text>Reserved for You</Text>
              </Title>
              <Text component='p'>
                <b>Is Your Brand Next?</b>
                <br />
                <br />
                I’ve helped aesthetics clinics and architects level up their
                digital game. Now it’s your turn. Secure your spot in my
                portfolio and let’s build your new <b>Squarespace</b> home.
                <br />
                <br />
                <Anchor
                  c='shamrock'
                  component={NextLink}
                  href='/contact'
                  sx={({ colors: { shamrock } }: MantineTheme) => ({
                    '&:hover': {
                      color: shamrock[5],
                      textDecoration: 'none',
                    },
                    span: {
                      fontSize: '0.75rem',
                      fontStyle: 'italic',
                    },
                  })}>
                  Let’s Chat!
                </Anchor>
              </Text>
            </Box>
          </Container>
        </Container>
      </Content>
    </>
  </>
);

export default Portfolio;
