import { Box } from '@mantine/core';
import classes from './VideoContainer.module.css';
import type { Video } from '@fixtures/types';
import type { FC } from 'react';

export const VideoContainer: FC<{ video?: Video }> = ({
  video: { videoTitle, videoUrl } = {},
}) => {
  if (!videoUrl) {
    return null;
  }

  return (
    <Box
      className={classes.wrapper}
      h={0}
      mb='xl'
      mt='lg'
      pb='30%'
      pos='relative'
      pt='26.3%'>
      {/* `loading` is load-bearing — see docs/components.md */}
      <iframe
        allowFullScreen
        className='youtube-frame'
        height='720'
        loading='lazy'
        src={videoUrl}
        title={videoTitle}
        width='1280'
      />
    </Box>
  );
};
