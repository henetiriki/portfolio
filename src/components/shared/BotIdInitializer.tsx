import { initBotId } from 'botid/client/core';
import { useEffect, useRef } from 'react';
import type { JSX } from 'react';

const protectedRoutes = [
  {
    method: 'POST',
    path: '/api/contact',
  },
];

const BotIdInitializer = (): JSX.Element | null => {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    initBotId({ protect: protectedRoutes });
    initialized.current = true;
  }, []);

  return null;
};

export default BotIdInitializer;
