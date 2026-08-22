import { Anchor, Box, Button, Space, Text, Title } from '@mantine/core';
import { IconMessage } from '@tabler/icons-react';
import Image from 'next/image';
import NextLink from 'next/link';
import { Content, Header } from '@components/content';
import { Seo } from '@components/shared';
import { portfolioItems } from '@fixtures/portfolio';
import { blurDataURL } from '@utils/common';
import classes from './portfolio.module.css';

import type { PortfolioItem } from '@fixtures/types';
import type { NextPage } from 'next';
import type { JSX } from 'react';

export const description =
  'Portfolio of freelance Squarespace web design projects by Louw Swart, including Beauty WithIn (Brisbane aesthetics clinic) and CSA Architects (South Africa).';

const portfolioImageSizes =
  '(min-width: 67.5em) 18.75rem, (min-width: 48em) calc(47.62vw - 4.75rem), (min-width: 36em) calc(100vw - 10rem), calc(100vw - 5rem)';

const Portfolio: NextPage = (): JSX.Element => (
  <>
    <Seo
      description={description}
      path='/portfolio'
      title='Freelance Web Design Portfolio'
    />
    <>
      <Header>
        Portfolio<span>freelance work I’ve done</span>
      </Header>
      <Content>
        <Title order={2}>Website portfolio</Title>
        <Space h='xl' />
        <Box className={classes.grid}>
          {portfolioItems.map(
            ({
              action,
              content,
              href,
              img: { alt, src },
              title,
            }: PortfolioItem) => (
              <Box className={classes.card} key={title}>
                <Box className={classes.imageWrapper}>
                  {href && (
                    <Anchor
                      className={classes.imageLink}
                      href={href}
                      rel='noopener noreferrer'
                      target='_blank'>
                      <Image
                        alt={alt}
                        fill
                        placeholder={blurDataURL(350, 192)}
                        sizes={portfolioImageSizes}
                        src={src}
                        style={{ objectFit: 'cover' }}
                      />
                    </Anchor>
                  )}
                  {!href && (
                    <Image
                      alt={alt}
                      fill
                      placeholder={blurDataURL(350, 192)}
                      sizes={portfolioImageSizes}
                      src={src}
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                </Box>
                <Box className={classes.cardBody}>
                  <Title order={3}>
                    {href && (
                      <Anchor
                        c='shamrock'
                        className={classes.titleLink}
                        href={href}
                        inherit
                        rel='noopener noreferrer'
                        target='_blank'>
                        {title}
                      </Anchor>
                    )}
                    {!href && title}
                  </Title>
                  <Text className={classes.cardText} component='p'>
                    {content}
                  </Text>
                  {action && (
                    <Button
                      className={classes.actionButton}
                      color='shamrock.4'
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
