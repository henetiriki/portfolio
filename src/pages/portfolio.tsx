import { Anchor, Box, Container, Text, Title } from '@mantine/core';
import getConfig from 'next/config';
import Head from 'next/head';
import Image from 'next/legacy/image';
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
        <Container
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            marginLeft: '-15px',
            marginRight: '-15px',
          }}>
          {portfolioItems.map(
            ({ content, imageUrl, title, url }: PortfolioItem) => (
              <Container
                key={title}
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
                  }}>
                  <Image
                    alt={title}
                    blurDataURL={blurDataURL(350, 192)}
                    layout='fill'
                    lazyBoundary='0px'
                    objectFit='cover'
                    placeholder='blur'
                    src={imageUrl}
                  />
                </Box>
                <Box
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
                </Box>
              </Container>
            )
          )}
        </Container>
      </Content>
    </>
  </>
);

export default Portfolio;
