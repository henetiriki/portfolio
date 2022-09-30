import { Row, styled } from '@nextui-org/react';
import { FC, PropsWithChildren } from 'react';
import {
  timeline,
  timelineBox,
  timelineContent,
  timelineIndicator,
} from '@styles';

export const TimelineIndicator: FC<PropsWithChildren> = ({
  children,
}): JSX.Element => <Row css={timelineIndicator}>{children}</Row>;

export const Timeline = styled('div', timeline);

export const TimelineBox = styled('div', timelineBox);

export const TimelineContent = styled('div', timelineContent);
