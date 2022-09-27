import { faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Container, Link, Text } from '@nextui-org/react';
import Head from 'next/head';
import {
  Content,
  Header,
  Timeline,
  TimelineBox,
  TimelineContent,
  TimelineIndicator,
} from '@components';
import { schools } from '@fixtures';
import { fullTitle } from '@utils';
import type { NextPage } from 'next';

const Education: NextPage = (): JSX.Element => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('Education')}</title>
    </Head>
    <>
      <Header>
        Education<span>what I’ve studied</span>
      </Header>
      <Content>
        <Container>
          <TimelineIndicator>
            <FontAwesomeIcon height={25} icon={faGraduationCap} width={25} />
          </TimelineIndicator>
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
                    <Text>
                      <Text as='span' css={{ fontStyle: 'italic' }}>
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
                        {name}, {location}
                      </Link>
                    </Text>
                    <Text as='h3'>{qualification}</Text>
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

export default Education;
