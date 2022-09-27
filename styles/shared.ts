import { CSS } from '@nextui-org/react';

export const waveWrapper: CSS = {
  lineHeight: 0,
  overflow: 'hidden',
  width: '100%',
};

export const waveImg: CSS = {
  width: '100%',
};

export const timelineIndicator: CSS = {
  alignItems: 'center',
  backgroundColor: '$shamrock',
  borderRadius: '100%',
  display: 'flex',
  height: '2.5rem',
  justifyContent: 'center',
  width: '2.5rem',
};

export const timeline: CSS = {
  borderLeft: '1px solid $silver',
  marginBottom: '30px',
  marginLeft: '20px',
};

export const timelineBox: CSS = {
  '&:after': {
    backgroundColor: '$shamrock',
    borderRadius: '100%',
    content: '',
    height: '20px',
    left: '-11px',
    opacity: 0.4,
    position: 'absolute',
    top: '40px',
    width: '20px',
  },
  '&:before': {
    backgroundColor: '$shamrock',
    borderRadius: '100%',
    content: '',
    height: '10px',
    left: '-6px',
    position: 'absolute',
    top: '45px',
    width: '10px',
  },
  paddingLeft: '40px',
  paddingTop: '20px',
  position: 'relative',
};

export const timelineContent: CSS = {
  '&:before': {
    borderColor: 'transparent rgba(255, 255, 255, 0.1) transparent transparent',
    borderStyle: 'solid',
    borderWidth: '15px 20px 15px 0',
    content: '',
    height: 0,
    position: 'absolute',
    right: '100%',
    top: '15px',
    width: 0,
  },
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  padding: '20px',
  position: 'relative',
};
