import { createContext, useContext, useMemo, useReducer } from 'react';
import { initialState, reducer } from '@state/reducer';
import type { ContextValue } from '@state/types';
import type { FC, PropsWithChildren } from 'react';

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

export const PortfolioStateProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const contextValue = useMemo<ContextValue>(
    () => ({ dispatch, state }),
    [dispatch, state]
  );

  return (
    <PortfolioStateContext.Provider value={contextValue}>
      {children}
    </PortfolioStateContext.Provider>
  );
};
