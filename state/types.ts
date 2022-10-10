export type Action = { payload: { id: string }; type: 'set-ig-img-id' };

export type Dispatch = (action: Action) => void;

export type PortfolioState = {
  id?: string;
};

export type ContextValue = {
  dispatch: Dispatch;
  state: PortfolioState;
};
