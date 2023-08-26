export type WindowSize = {
  height: number | undefined;
  width: number | undefined;
};

export type FormValueKey = 'email' | 'heuning' | 'message' | 'name';

export type FormValues = {
  [key in FormValueKey]?: string;
};
