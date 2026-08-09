import { IconBriefcase, IconSchool } from '@tabler/icons-react';
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
import { Seo } from '@components/shared';
import { jobs, schools } from '@fixtures/experience';
import type { Job, School } from '@fixtures/types';
import type { NextPage } from 'next';
import type { JSX } from 'react';

const seoDescription =
  'Work and education history for Louw Swart, covering front-end and full-stack roles across banking, government, media and ecommerce.';

const Experience: NextPage = (): JSX.Element => (
  <>
    <Seo description={seoDescription} path='/experience' title='Experience' />
    <>
      <Header>
        Experience<span>where I’ve worked so far</span>
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
