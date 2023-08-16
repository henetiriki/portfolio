import {
  faBriefcase,
  faGraduationCap,
} from '@fortawesome/free-solid-svg-icons';
import { Anchor, Text, Title } from '@mantine/core';
import getConfig from 'next/config';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Content, Header } from '@components/content';
import {
  Timeline,
  TimelineBox,
  TimelineContent,
  TimelineHeading,
  TimelineIndicator,
  VideoContainer,
} from '@components/experience';
import { description, jobs, schools } from '@fixtures/experience';
import { useImgSetup } from '@hooks';
import {
  timelineFromTo,
  timelineLink,
  timelineLinkText,
  timelineLocation,
  timelineTitle,
} from '@styles/experience';
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
                    <Text span sx={timelineFromTo}>
                      {from} - {to}
                    </Text>{' '}
                    {url && (
                      <Text sx={timelineLinkText}>
                        <Anchor
                          href={url}
                          rel='noopener noreferrer'
                          sx={timelineLink}
                          target='_blank'>
                          {name}
                        </Anchor>
                      </Text>
                    )}
                    {!url && <Text sx={timelineLinkText}>{name}</Text>}
                    <Text size='sm' sx={timelineLocation}>
                      {location}
                    </Text>
                    <Title order={3} sx={timelineTitle}>
                      {title}
                    </Title>
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
                    <Text span sx={timelineFromTo}>
                      {from} - {to}
                    </Text>
                    <Text sx={timelineLinkText}>
                      <Anchor
                        href={url}
                        rel='noopener noreferrer'
                        sx={timelineLink}
                        target='_blank'>
                        {name}
                      </Anchor>
                    </Text>
                    <Text size='md' sx={timelineLocation}>
                      {location}
                    </Text>
                    <Title order={3} sx={timelineTitle}>
                      {qualification}
                    </Title>
                    {content}
                  </TimelineContent>
                </TimelineBox>
              )
            )}
          </Timeline>
        </Content>
      </>
    </>
  );
};

export { getStaticProps } from '@utils/common';

export default Experience;
