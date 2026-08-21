import { render } from '@testing-library/react';
import { initBotId } from 'botid/client/core';
import { StrictMode } from 'react';
import { BotIdInitializer } from '@components/shared';

jest.mock('botid/client/core', () => ({
  initBotId: jest.fn(),
}));

describe('BotIdInitializer', () => {
  it('initializes BotID for the contact endpoint without rendering markup', () => {
    const { container } = render(<BotIdInitializer />);

    expect(container).toBeEmptyDOMElement();
    expect(initBotId).toHaveBeenCalledWith({
      protect: [
        {
          method: 'POST',
          path: '/api/contact',
        },
      ],
    });
  });

  it('does not initialize twice when Strict Mode reruns effects', () => {
    render(
      <StrictMode>
        <BotIdInitializer />
      </StrictMode>
    );

    expect(initBotId).toHaveBeenCalledTimes(1);
  });
});
