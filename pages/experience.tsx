import {
  faBriefcase,
  faGraduationCap,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Container, Link, Spacer, Text, styled } from '@nextui-org/react';
import Head from 'next/head';
import { Content, Header } from '@components';
import { jobs, schools } from '@fixtures/experience';
import {
  timeline,
  timelineBox,
  timelineContent,
  timelineHeading,
  timelineIndicator,
} from '@styles';
import { fullTitle } from '@utils/head';
import type { NextPage } from 'next';

const TimelineHeading = styled('div', timelineHeading);

const TimelineIndicator = styled('div', timelineIndicator);

const Timeline = styled('div', timeline);

const TimelineBox = styled('div', timelineBox);

const TimelineContent = styled('div', timelineContent);

const Experience: NextPage = (): JSX.Element => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('Experience')}</title>
    </Head>
    <>
      <Header>
        Experience<span>what I’ve done so far</span>
      </Header>
      <Content>
        <Container>
          <TimelineHeading>
            <TimelineIndicator>
              <FontAwesomeIcon height={20} icon={faBriefcase} width={20} />
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
                  year: { from, to },
                },
                idx
              ) => (
                <TimelineBox key={idx}>
                  <TimelineContent>
                    <Text
                      css={{ color: '$silver', fontStyle: 'italic', mb: 0 }}
                      span>
                      {from} - {to}
                    </Text>{' '}
                    {url && (
                      <Text css={{ fs: '$lg', mb: 0 }}>
                        <Link
                          css={{
                            color: '$shamrock',
                            span: {
                              fontStyle: 'italic',
                              fs: '$sm',
                              pl: '$2',
                            },
                          }}
                          href={url}
                          isExternal
                          rel='noopener noreferrer'
                          target='_blank'>
                          {name}
                        </Link>
                      </Text>
                    )}
                    {!url && <Text css={{ fs: '$lg', mb: 0 }}>{name}</Text>}
                    <Text
                      css={{
                        color: '$silver',
                        span: {
                          fontStyle: 'italic',
                        },
                      }}
                      size='$xs'>
                      {location}
                    </Text>
                    <Text
                      css={{
                        span: {
                          fs: '$lg',
                        },
                      }}
                      h3>
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
                  </TimelineContent>
                </TimelineBox>
              )
            )}
          </Timeline>
          <Spacer y={4} />
          <TimelineHeading>
            <TimelineIndicator>
              <FontAwesomeIcon height={20} icon={faGraduationCap} width={20} />
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
                },
                idx
              ) => (
                <TimelineBox key={idx}>
                  <TimelineContent>
                    <Text
                      css={{ color: '$silver', fontStyle: 'italic', mb: 0 }}
                      span>
                      {from} - {to}
                    </Text>{' '}
                    <Text css={{ fs: '$lg', mb: 0 }}>
                      <Link
                        css={{
                          color: '$shamrock',
                        }}
                        href={url}
                        isExternal
                        rel='noopener noreferrer'
                        target='_blank'>
                        {name}
                      </Link>
                    </Text>
                    <Text css={{ color: '$silver' }} size='$xs'>
                      {location}
                    </Text>
                    <Text h3>{qualification}</Text>
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

export default Experience;
