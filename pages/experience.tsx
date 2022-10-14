import {
  faBriefcase,
  faGraduationCap,
} from '@fortawesome/free-solid-svg-icons';
import { Container, Link, Spacer, Text, styled } from '@nextui-org/react';
import { InferGetStaticPropsType } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Content, Header } from '@components/content';
import { description, jobs, schools } from '@fixtures/experience';
import { Job, School } from '@fixtures/types';
import { useImgSetup } from '@hooks';
import {
  timeline,
  timelineBox,
  timelineContent,
  timelineFromTo,
  timelineHeading,
  timelineIndicator,
  timelineLink,
  timelineLinkText,
  timelineLocation,
  timelineTitle,
  videoContainer,
} from '@styles/experience';
import { getStaticProps } from '@utils/common';
import {
  getExperienceDescription,
  getExperienceKeywords,
} from '@utils/experience';
import { fullTitle } from '@utils/head';
import type { NextPage } from 'next';

const DynamicFontAwesomeIcon = dynamic(
  () =>
    import('@fortawesome/react-fontawesome').then(mod => mod.FontAwesomeIcon),
  {
    ssr: false,
  }
);

const TimelineHeading = styled('div', timelineHeading);

const TimelineIndicator = styled('div', timelineIndicator);

const Timeline = styled('div', timeline);

const TimelineBox = styled('div', timelineBox);

const TimelineContent = styled('div', timelineContent);

const VideoContainer = styled('div', videoContainer);

const Experience: NextPage = ({
  data,
}: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element => {
  useImgSetup(data);

  return (
    <>
      <Head>
        <title key='pageTitle'>{fullTitle('Experience')}</title>
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
          <Container>
            <TimelineHeading>
              <TimelineIndicator>
                <DynamicFontAwesomeIcon
                  height={20}
                  icon={faBriefcase}
                  width={20}
                />
              </TimelineIndicator>{' '}
              <Text css={{ lh: '1rem' }} h2>
                Work History
              </Text>
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
                      <Text css={timelineFromTo} span>
                        {from} - {to}
                      </Text>{' '}
                      {url && (
                        <Text css={timelineLinkText}>
                          <Link
                            css={timelineLink}
                            href={url}
                            isExternal
                            rel='noopener noreferrer'
                            target='_blank'>
                            {name}
                          </Link>
                        </Text>
                      )}
                      {!url && <Text css={timelineLinkText}>{name}</Text>}
                      <Text css={timelineLocation} size='$xs'>
                        {location}
                      </Text>
                      <Text css={timelineTitle} h3>
                        {title}
                      </Text>
                      {content}
                      {accomplishments && (
                        <>
                          <Spacer y={1} />
                          <Text h5>Accomplishments</Text>
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
            <Spacer y={4} />
            <TimelineHeading>
              <TimelineIndicator>
                <DynamicFontAwesomeIcon
                  height={20}
                  icon={faGraduationCap}
                  width={20}
                />
              </TimelineIndicator>
              <Text css={{ lh: '1rem' }} h2>
                Education
              </Text>
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
                      <Text css={timelineFromTo} span>
                        {from} - {to}
                      </Text>{' '}
                      <Text css={timelineLinkText}>
                        <Link
                          css={timelineLink}
                          href={url}
                          isExternal
                          rel='noopener noreferrer'
                          target='_blank'>
                          {name}
                        </Link>
                      </Text>
                      <Text css={timelineLocation} size='$xs'>
                        {location}
                      </Text>
                      <Text css={timelineTitle} h3>
                        {qualification}
                      </Text>
                      {content}
                    </TimelineContent>
                  </TimelineBox>
                )
              )}
            </Timeline>
          </Container>
        </Content>
      </>
    </>
  );
};

export { getStaticProps } from '@utils/common';

export default Experience;
