import { createContext, useContext, useReducer } from 'react';
import { initialState, reducer } from '@state/reducer';
import type { ContextValue } from '@state/types';
import type { FC, JSX, PropsWithChildren } from 'react';

const PortfolioStateContext = createContext<ContextValue | undefined>(
  undefined
);

export const usePortfolioState = () => {
  const context = useContext(PortfolioStateContext);

  if (context === undefined) {
    throw new Error(
      'usePortfolioState must be used withing a PortfolioStateProvider'
    );
  }

  return context;
};

export const PortfolioStateProvider: FC<PropsWithChildren> = ({
  children,
}): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <PortfolioStateContext.Provider value={{ dispatch, state }}>
      {children}
    </PortfolioStateContext.Provider>
  );
};
