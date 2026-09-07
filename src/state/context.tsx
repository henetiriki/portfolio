import { createContext, useContext, useMemo, useReducer } from 'react';
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
      'usePortfolioState must be used within a PortfolioStateProvider'
    );
  }

  return context;
};

export const PortfolioStateProvider: FC<PropsWithChildren> = ({
  children,
}): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ dispatch, state }), [dispatch, state]);

  return (
    <PortfolioStateContext.Provider value={value}>
      {children}
    </PortfolioStateContext.Provider>
  );
};
