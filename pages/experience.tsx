import { faBriefcase } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Container, Link, Spacer, Text } from '@nextui-org/react';
import Head from 'next/head';
import {
  Content,
  Header,
  Timeline,
  TimelineBox,
  TimelineContent,
  TimelineIndicator,
} from '@components';
import { jobs } from '@fixtures';
import { fullTitle } from '@utils';
import type { NextPage } from 'next';

const Experience: NextPage = (): JSX.Element => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('Experience')}</title>
    </Head>
    <>
      <Header>
        Work experience<span>what I’ve done so far</span>
      </Header>
      <Content>
        <Container>
          <TimelineIndicator>
            <FontAwesomeIcon height={25} icon={faBriefcase} width={25} />
          </TimelineIndicator>
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
                    <Text>
                      <Text css={{ fontStyle: 'italic' }} span>
                        {from} - {to}
                      </Text>{' '}
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
                    <Text size='$xs'>{location}</Text>
                    <Text h3>{title}</Text>
                    {content}
                    {accomplishments && (
                      <>
                        <Spacer y={2} />
                        <Text h5>Accomplishments</Text>
                        {accomplishments}
                      </>
                    )}
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
