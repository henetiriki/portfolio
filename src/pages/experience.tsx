import { IconBriefcase, IconSchool } from '@tabler/icons-react';
import getConfig from 'next/config';
import Head from 'next/head';
import { Content, Header } from '@components/content';
import {
  Timeline,
  TimelineBox,
  TimelineContent,
  TimelineFromTo,
  TimelineHeading,
  TimelineInstitution,
  TimelineLocation,
  TimelineTitle,
  VideoContainer,
} from '@components/experience';
import { description, jobs, schools } from '@fixtures/experience';
import {
  getExperienceDescription,
  getExperienceKeywords,
} from '@utils/experience';
import { fullTitle } from '@utils/head';
import type { Job, School } from '@fixtures/types';
import type { NextPage } from 'next';
import type { JSX } from 'react';

const {
  publicRuntimeConfig: { siteUrl },
} = getConfig();

const Experience: NextPage = (): JSX.Element => (
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
        <TimelineHeading
          icon={<IconBriefcase size={20} />}
          title='Work History'
        />
        <Timeline>
          {jobs.map(
            (
              {
                accomplishments,
                content,
                institution: { location, name, url },
                title,
                video,
                year,
              }: Job,
              idx: number
            ) => (
              <TimelineBox key={`job-${idx}`}>
                <TimelineContent>
                  <TimelineFromTo year={year} />
                  <TimelineInstitution name={name} url={url} />
                  <TimelineLocation location={location} />
                  <TimelineTitle title={title} />
                  {content}
                  {accomplishments}
                  <VideoContainer video={video} />
                </TimelineContent>
              </TimelineBox>
            )
          )}
        </Timeline>
        <TimelineHeading icon={<IconSchool size={20} />} title='Education' />
        <Timeline>
          {schools.map(
            (
              {
                content,
                institution: { location, name, url },
                qualification,
                year,
              }: School,
              idx: number
            ) => (
              <TimelineBox key={`school-${idx}`}>
                <TimelineContent>
                  <TimelineFromTo year={year} />
                  <TimelineInstitution name={name} url={url} />
                  <TimelineLocation location={location} />
                  <TimelineTitle title={qualification} />
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

export default Experience;
