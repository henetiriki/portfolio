import { Action, PortfolioState } from '@state/types';

export const initialState: PortfolioState = {};

export const reducer = (
  state: PortfolioState,
  { payload, type }: Action
): PortfolioState => {
  switch (type) {
    case 'set-ig-img-id':
      const { id } = payload;

      return { ...state, id };
  }
};
