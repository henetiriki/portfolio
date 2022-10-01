import { CSS } from '@nextui-org/react';

export const waveWrapper: CSS = {
  h: '10rem',
  lh: 0,
  ov: 'hidden',
  w: '100%',
};

export const timelineIndicator: CSS = {
  bgColor: '$shamrock',
  br: '100%',
  dflex: 'center',
  h: '2.5rem',
  w: '2.5rem',
};

export const timeline: CSS = {
  borderLeft: '1px solid $silver',
  mb: '30px',
  ml: '20px',
};

export const timelineBox: CSS = {
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

export const timelineContent: CSS = {
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
