import styled from '@emotion/styled';
import {
  faBriefcase,
  faGraduationCap,
} from '@fortawesome/free-solid-svg-icons';
import { Anchor, Container, Text, Title } from '@mantine/core';
import getConfig from 'next/config';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Content, Header } from '@components/content';
import { description, jobs, schools } from '@fixtures/experience';
import { useImgSetup } from '@hooks';
import {
  getExperienceDescription,
  getExperienceKeywords,
} from '@utils/experience';
import { fullTitle } from '@utils/head';
import type { Job, School } from '@fixtures/types';
import type { getStaticProps } from '@utils/common';
import type { InferGetStaticPropsType, NextPage } from 'next';
import type { JSX } from 'react';

const DynamicFontAwesomeIcon = dynamic(
  () =>
    import('@fortawesome/react-fontawesome').then(mod => mod.FontAwesomeIcon),
  {
    ssr: false,
  }
);

const {
  publicRuntimeConfig: { siteUrl },
} = getConfig();

const TimelineHeading = styled.div``;

const TimelineIndicator = styled.div``;

const Timeline = styled.div``;

const TimelineBox = styled.div``;

const TimelineContent = styled.div``;

const VideoContainer = styled.div``;

const Experience: NextPage = ({
  data,
}: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element => {
  useImgSetup(data);

  return (
    <>
      <Head>
        <title key='pageTitle'>{fullTitle('Experience')}</title>
        <link href={`${siteUrl}/experience`} key='canonical' rel='canonical' />
        <meta
          content={`Companies & Roles: ${getExperienceDescription(jobs)}`}
          key='pageDescription'
          name='description'
        />
        <meta
          content={getExperienceKeywords(jobs)}
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
          Experience<span>what I’ve done so far</span>
        </Header>
        <Content>
          <div>
            <Container>
              <TimelineHeading>
                <TimelineIndicator>
                  <DynamicFontAwesomeIcon
                    height={20}
                    icon={faBriefcase}
                    width={20}
                  />
                </TimelineIndicator>{' '}
                <Title order={2}>Work History</Title>
              </TimelineHeading>
              <Timeline>
                {jobs.map(
                  (
                    {
                      accomplishments,
                      content,
                      institution: { location, name, url },
                      title,
                      video,
                      year: { from, to },
                    }: Job,
                    idx: number
                  ) => (
                    <TimelineBox key={idx}>
                      <TimelineContent>
                        <Text span>
                          {from} - {to}
                        </Text>{' '}
                        {url && (
                          <Text>
                            <Anchor
                              href={url}
                              rel='noopener noreferrer'
                              target='_blank'>
                              {name}
                            </Anchor>
                          </Text>
                        )}
                        {!url && <Text>{name}</Text>}
                        <Text size='xs'>{location}</Text>
                        <Title order={3}>{title}</Title>
                        {content}
                        {accomplishments && (
                          <>
                            <Title order={5}>Accomplishments</Title>
                            {accomplishments}
                          </>
                        )}
                        {video && (
                          <VideoContainer>
                            <iframe
                              allowFullScreen
                              className='youtube-frame'
                              height='720'
                              src={video.videoUrl}
                              title={video.videoTitle}
                              width='1280'
                            />
                          </VideoContainer>
                        )}
                      </TimelineContent>
                    </TimelineBox>
                  )
                )}
              </Timeline>
              <TimelineHeading>
                <TimelineIndicator>
                  <DynamicFontAwesomeIcon
                    height={20}
                    icon={faGraduationCap}
                    width={20}
                  />
                </TimelineIndicator>
                <Title order={2}>Education</Title>
              </TimelineHeading>
              <Timeline>
                {schools.map(
                  (
                    {
                      content,
                      institution: { location, name, url },
                      qualification,
                      year: { from, to },
                    }: School,
                    idx: number
                  ) => (
                    <TimelineBox key={idx}>
                      <TimelineContent>
                        <Text span>
                          {from} - {to}
                        </Text>{' '}
                        <Text>
                          <Anchor
                            href={url}
                            rel='noopener noreferrer'
                            target='_blank'>
                            {name}
                          </Anchor>
                        </Text>
                        <Text size='xs'>{location}</Text>
                        <Title order={3}>{qualification}</Title>
                        {content}
                      </TimelineContent>
                    </TimelineBox>
                  )
                )}
              </Timeline>
            </Container>
          </div>
        </Content>
      </>
    </>
  );
};

export { getStaticProps } from '@utils/common';

export default Experience;
