import { Box } from '@mantine/core';
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
      h={0}
      mb='xl'
      mt='lg'
      pb='30%'
      pos='relative'
      pt='26.3%'
      sx={{
        '.youtube-frame': {
          border: '0',
        },
        'iframe, object, embed': {
          border: 0,
          height: '100%',
          left: '0',
          position: 'absolute',
          top: '0',
          width: '100%',
        },
        overflow: 'hidden',
      }}>
      <iframe
        allowFullScreen
        className='youtube-frame'
        height='720'
        src={videoUrl}
        title={videoTitle}
        width='1280'
      />
    </Box>
  );
};
