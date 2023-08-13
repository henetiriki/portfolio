import type { MantineTheme, Sx } from '@mantine/core';

export const timelineHeading: Sx = {
  alignItems: 'baseline',
  display: 'flex',
};

export const timelineIndicator: Sx = ({
  colors: { shamrock },
}: MantineTheme) => ({
  alignItems: 'center',
  backgroundColor: shamrock[4],
  borderRadius: '100%',
  display: 'flex',
  height: '2.5rem',
  justifyContent: 'center',
  marginRight: '1.25rem',
  width: '2.5rem',
});

export const timeline: Sx = ({ colors: { silver } }: MantineTheme) => ({
  borderLeft: `1px solid ${silver[4]}`,
  marginBottom: '30px',
  marginLeft: '20px',
});

export const timelineBox: Sx = ({ colors: { shamrock } }: MantineTheme) => ({
  '&:after': {
    backgroundColor: shamrock[4],
    borderRadius: '100%',
    content: "''",
    height: '20px',
    left: '-11px',
    opacity: 0.4,
    position: 'absolute',
    top: '70px',
    width: '20px',
  },
  '&:before': {
    backgroundColor: shamrock[4],
    borderRadius: '100%',
    content: "''",
    height: '10px',
    left: '-6px',
    position: 'absolute',
    top: '75px',
    width: '10px',
  },
  paddingLeft: '40px',
  paddingTop: '50px',
  position: 'relative',
});

export const timelineContent: Sx = ({
  colors: { white },
  fn: { rgba },
}: MantineTheme) => ({
  '&:before': {
    borderColor: `transparent ${rgba(white[4], 0.1)} transparent transparent`,
    borderStyle: 'solid',
    borderWidth: '15px 20px 15px 0',
    content: "''",
    height: 0,
    position: 'absolute',
    right: '100%',
    top: '15px',
    width: 0,
  },
  backgroundColor: rgba(white[4], 0.1),
  borderRadius: '8px',
  padding: '20px',
  position: 'relative',
});

export const timelineFromTo: Sx = ({ colors: { silver } }: MantineTheme) => ({
  color: silver[4],
  fontStyle: 'italic',
  marginBottom: 0,
});

export const timelineLocation: Sx = ({ colors: { silver } }: MantineTheme) => ({
  color: silver[4],
  marginBottom: '1rem',
  span: {
    fontStyle: 'italic',
  },
});

export const timelineLinkText: Sx = {
  fontSize: '1.25rem',
  mb: 0,
};

export const timelineLink: Sx = ({ colors: { shamrock } }: MantineTheme) => ({
  '&:hover': {
    color: shamrock[5],
    textDecoration: 'none',
  },
  color: shamrock[4],
  span: {
    fontSize: '0.75rem',
    fontStyle: 'italic',
  },
});

export const timelineTitle: Sx = {
  span: {
    fontSize: '1.25rem',
  },
};

export const videoContainer: Sx = {
  '.youtube-frame': {
    border: '0',
  },
  height: '0',
  'iframe, object, embed': {
    border: 0,
    height: '100%',
    left: '0',
    position: 'absolute',
    top: '0',
    width: '100%',
  },
  marginBottom: '$lg',
  marginTop: '$2xl',
  overflow: 'hidden',
  paddingBottom: '30%',
  paddingTop: '26.3%',
  position: 'relative',
};
