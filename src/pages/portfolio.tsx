import { Anchor, Box, Button, Space, Text, Title } from '@mantine/core';
import { IconMessage } from '@tabler/icons-react';
import getConfig from 'next/config';
import Head from 'next/head';
import Image from 'next/legacy/image';
import NextLink from 'next/link';
import { Content, Header } from '@components/content';
import { description, portfolioItems } from '@fixtures/portfolio';
import { blurDataURL } from '@utils/common';

import { fullTitle } from '@utils/head';
import type { PortfolioItem } from '@fixtures/types';
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
      <link href={`${siteUrl}/portfolio`} key='canonical' rel='canonical' />
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
        <Title order={2}>Website portfolio</Title>
        <Space h='xl' />
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            justifyContent: 'space-around',
          }}>
          {portfolioItems.map(
            ({ action, content, imageUrl, title, url }: PortfolioItem) => (
              <Box
                key={title}
                sx={({ fn: { largerThan } }: MantineTheme) => ({
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  [largerThan('sm')]: {
                    width: 'calc(100% / 2.1)',
                  },
                  [largerThan(1080)]: {
                    width: 'calc(100% / 3.3)',
                  },
                  width: '100%',
                })}>
                <Box
                  sx={({ fn: { largerThan } }: MantineTheme) => ({
                    color: 'white',
                    [largerThan(1080)]: {
                      height: '155px',
                    },
                    height: '200px',
                    padding: 0,
                    position: 'relative',
                  })}>
                  {url && (
                    <Anchor
                      href={url}
                      rel='noopener noreferrer'
                      sx={{
                        img: {
                          '&:hover': {
                            transform: 'scale(1.1)',
                          },
                          transition: 'transform 0.25s ease',
                        },
                      }}
                      target='_blank'>
                      <Image
                        alt={title}
                        blurDataURL={blurDataURL(350, 192)}
                        layout='fill'
                        lazyBoundary='0px'
                        objectFit='cover'
                        placeholder='blur'
                        src={imageUrl}
                      />
                    </Anchor>
                  )}
                  {!url && (
                    <Image
                      alt={title}
                      blurDataURL={blurDataURL(350, 192)}
                      layout='fill'
                      lazyBoundary='0px'
                      objectFit='cover'
                      placeholder='blur'
                      src={imageUrl}
                    />
                  )}
                </Box>
                <Box
                  sx={{
                    padding: '15px',
                  }}>
                  <Title order={3}>
                    {url && (
                      <Anchor
                        c='shamrock'
                        href={url}
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
                        {title}
                      </Anchor>
                    )}
                    {!url && <Text>{title}</Text>}
                  </Title>
                  <Text
                    component='p'
                    sx={{
                      span: {
                        fontSize: '1rem',
                        fontWeight: 700,
                      },
                    }}>
                    {content}
                  </Text>
                  {action && (
                    <Button
                      color='shamrock'
                      component={NextLink}
                      href={action.href}
                      leftIcon={<IconMessage size={21} />}
                      radius='lg'
                      size='lg'
                      sx={({ colors: { shamrock } }: MantineTheme) => ({
                        '&:hover': {
                          color: shamrock[5],
                          textDecoration: 'none',
                        },
                        fontSize: '1rem',
                        marginTop: '1rem',
                      })}
                      variant='outline'>
                      {action.label}
                    </Button>
                  )}
                </Box>
              </Box>
            )
          )}
        </Box>
      </Content>
    </>
  </>
);

export default Portfolio;
