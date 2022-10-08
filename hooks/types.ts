export type WindowSize = {
  height: number;
  width: number;
};

export type FormValueKey = 'email' | 'heuning' | 'message' | 'name';

export type FormValues = {
  [key in FormValueKey]?: string;
};

export type ImageId = {
  id: string;
};
