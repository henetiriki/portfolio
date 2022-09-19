import { format } from 'date-fns';
import { useState } from 'react';

const Copyright = () => {
  const [date] = useState<Date>(new Date());
  return (
    <span>
      © 2014 - {format(date, 'yyyy')}{' '}
      <a href='https://github.com/henetiriki' target='_blank' rel='noreferrer'>
        @henetiriki
      </a>
    </span>
  );
};

export default Copyright;
