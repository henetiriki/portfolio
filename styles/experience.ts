export const timelineHeading = {
  ai: 'baseline',
  d: 'flex',
};

export const timelineIndicator = {
  bgColor: '$shamrock',
  br: '100%',
  dflex: 'center',
  h: '2.5rem',
  mr: '1.25rem',
  w: '2.5rem',
};

export const timeline = {
  borderLeft: '1px solid $silver',
  mb: '30px',
  ml: '20px',
};

export const timelineBox = {
  '&:after': {
    bgColor: '$shamrock',
    br: '100%',
    content: '',
    h: '20px',
    left: '-11px',
    opacity: 0.4,
    position: 'absolute',
    top: '70px',
    w: '20px',
  },
  '&:before': {
    bgColor: '$shamrock',
    br: '100%',
    content: '',
    h: '10px',
    left: '-6px',
    position: 'absolute',
    top: '75px',
    w: '10px',
  },
  pl: '40px',
  position: 'relative',
  pt: '50px',
};

export const timelineContent = {
  '&:before': {
    borderColor: 'transparent rgba(255, 255, 255, 0.1) transparent transparent',
    borderStyle: 'solid',
    bw: '15px 20px 15px 0',
    content: '',
    h: 0,
    position: 'absolute',
    right: '100%',
    top: '15px',
    w: 0,
  },
  bgColor: 'rgba(255, 255, 255, 0.1)',
  br: '$xs',
  p: '20px',
  position: 'relative',
};

export const timelineFromTo = {
  color: '$silver',
  fontStyle: 'italic',
  mb: 0,
};

export const timelineLocation = {
  color: '$silver',
  span: {
    fontStyle: 'italic',
  },
};

export const timelineLinkText = {
  fs: '$lg',
  mb: 0,
};

export const timelineLink = {
  color: '$shamrock',
  span: {
    fontStyle: 'italic',
    fs: '$sm',
    pl: '$2',
  },
};

export const timelineTitle = {
  span: {
    fs: '$lg',
  },
};

export const videoContainer = {
  '.youtube-frame': {
    border: '0',
  },
  h: '0',
  'iframe, object, embed': {
    border: 0,
    h: '100%',
    left: '0',
    position: 'absolute',
    top: '0',
    w: '100%',
  },
  mb: '$lg',
  mt: '$2xl',
  ov: 'hidden',
  pb: '30%',
  position: 'relative',
  pt: '26.3%',
};
