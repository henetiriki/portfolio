export type Action = { payload: { igImgId: string }; type: 'set-ig-img-id' };

export type Dispatch = (action: Action) => void;

export type PortfolioState = {
  igImgId?: string;
};

export type ContextValue = {
  dispatch: Dispatch;
  state: PortfolioState;
};
