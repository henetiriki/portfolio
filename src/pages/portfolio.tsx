import { Anchor, Box, Button, Space, Text, Title } from '@mantine/core';
import { IconMessage } from '@tabler/icons-react';
import Head from 'next/head';
import Image from 'next/image';
import NextLink from 'next/link';
import { Content, Header } from '@components/content';
import { description, portfolioItems } from '@fixtures/portfolio';
import { blurDataURL } from '@utils/common';
import { fullTitle } from '@utils/head';
import classes from './portfolio.module.css';

import type { PortfolioItem } from '@fixtures/types';
import type { NextPage } from 'next';
import type { JSX } from 'react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

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
        <Box className={classes.grid}>
          {portfolioItems.map(
            ({ action, content, imageUrl, title, url }: PortfolioItem) => (
              <Box className={classes.card} key={title}>
                <Box className={classes.imageWrapper}>
                  {url && (
                    <Anchor
                      className={classes.imageLink}
                      href={url}
                      rel='noopener noreferrer'
                      target='_blank'>
                      <Image
                        alt={title}
                        fill
                        placeholder={blurDataURL(350, 192)}
                        sizes='100vw'
                        src={imageUrl}
                        style={{ objectFit: 'cover' }}
                      />
                    </Anchor>
                  )}
                  {!url && (
                    <Image
                      alt={title}
                      fill
                      placeholder={blurDataURL(350, 192)}
                      sizes='100vw'
                      src={imageUrl}
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                </Box>
                <Box className={classes.cardBody}>
                  <Title order={3}>
                    {url && (
                      <Anchor
                        c='shamrock'
                        className={classes.titleLink}
                        href={url}
                        rel='noopener noreferrer'
                        target='_blank'>
                        {title}
                      </Anchor>
                    )}
                    {!url && <Text>{title}</Text>}
                  </Title>
                  <Text className={classes.cardText} component='p'>
                    {content}
                  </Text>
                  {action && (
                    <Button
                      className={classes.actionButton}
                      color='shamrock'
                      component={NextLink}
                      href={action.href}
                      leftSection={<IconMessage size={21} />}
                      radius='lg'
                      size='lg'
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
