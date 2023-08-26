import type { Tuple } from '@mantine/core';

export type ExtendedCustomColor =
  | 'alizarin'
  | 'allports'
  | 'blackRussian'
  | 'cinder'
  | 'corn'
  | 'gunmetal'
  | 'matterhorn'
  | 'mediumSeaGreen'
  | 'paynesGrey'
  | 'pineGreen'
  | 'pumpkin'
  | 'shamrock'
  | 'silver'
  | 'torchRed'
  | 'valhalla'
  | 'viking'
  | 'whisper';

export type ExtendedCustomColorOverrides = Record<
  ExtendedCustomColor,
  Tuple<string, 10>
>;

export const colorOverrides: ExtendedCustomColorOverrides = {
  /* eslint-disable sort-keys/sort-keys-fix */
  whisper: [
    '#F8F8F8',
    '#F6F6F6',
    '#F4F4F4',
    '#F1F1F1',
    '#EEEEEE',
    '#BEBEBE',
    '#989898',
    '#7A7A7A',
    '#626262',
    '#4E4E4E',
  ],
  silver: [
    '#E5E5E5',
    '#DFDFDF',
    '#D7D7D7',
    '#CDCDCD',
    '#C1C1C1',
    '#9A9A9A',
    '#7B7B7B',
    '#626262',
    '#4E4E4E',
    '#3E3E3E',
  ],
  matterhorn: [
    '#B7B7B7',
    '#A5A5A5',
    '#8E8E8E',
    '#727272',
    '#4F4F4F',
    '#3F3F3F',
    '#323232',
    '#282828',
    '#202020',
    '#1A1A1A',
  ],
  gunmetal: [
    '#ACADAE',
    '#97999A',
    '#7D7F81',
    '#5C5F61',
    '#333739',
    '#292C2E',
    '#212325',
    '#1A1C1E',
    '#151618',
    '#111213',
  ],
  cinder: [
    '#A7A8A9',
    '#919293',
    '#767778',
    '#545556',
    '#292B2C',
    '#212223',
    '#1A1B1C',
    '#151616',
    '#111212',
    '#0E0E0E',
  ],
  paynesGrey: [
    '#AEB0B9',
    '#9A9CA7',
    '#818391',
    '#626475',
    '#3B3D53',
    '#2F3142',
    '#262735',
    '#1E1F2A',
    '#181922',
    '#13141B',
  ],
  valhalla: [
    '#A6A7B1',
    '#90919D',
    '#747585',
    '#515266',
    '#252740',
    '#1E1F33',
    '#181929',
    '#131421',
    '#0F101A',
    '#0C0D15',
  ],
  blackRussian: [
    '#9A9AA4',
    '#81818D',
    '#616271',
    '#393B4D',
    '#080A20',
    '#06081A',
    '#050615',
    '#040511',
    '#03040E',
    '#02030B',
  ],
  pumpkin: [
    '#FFC8A0',
    '#FFBA88',
    '#FFA96A',
    '#FF9445',
    '#FF7917',
    '#CC6112',
    '#A34E0E',
    '#823E0B',
    '#683209',
    '#532807',
  ],
  corn: [
    '#FBF7C1',
    '#FAF5B1',
    '#F9F29D',
    '#F7EF85',
    '#F5EB67',
    '#C4BC52',
    '#9D9642',
    '#7E7835',
    '#65602A',
    '#514D22',
  ],
  pineGreen: [
    '#97C8C3',
    '#7DBAB4',
    '#5CA9A1',
    '#33938A',
    '#00786D',
    '#006057',
    '#004D46',
    '#003E38',
    '#00322D',
    '#002824',
  ],
  mediumSeaGreen: [
    '#A9EAC5',
    '#94E5B6',
    '#79DEA4',
    '#58D68D',
    '#2ECC71',
    '#25A35A',
    '#1E8248',
    '#18683A',
    '#13532E',
    '#0F4225',
  ],
  shamrock: [
    '#A7F4C8',
    '#91F1BA',
    '#75EDA9',
    '#52E893',
    '#27E278',
    '#1FB560',
    '#19914D',
    '#14743E',
    '#105D32',
    '#0D4A28',
  ],
  viking: [
    '#B3DBE7',
    '#A0D2E1',
    '#88C7DA',
    '#6AB9D1',
    '#45A8C5',
    '#37869E',
    '#2C6B7E',
    '#235665',
    '#1C4551',
    '#163741',
  ],
  allports: [
    '#A9C3CA',
    '#93B4BD',
    '#78A1AD',
    '#568998',
    '#2C6B7E',
    '#235665',
    '#1C4551',
    '#163741',
    '#122C34',
    '#0E232A',
  ],
  alizarin: [
    '#F4A7AC',
    '#F19197',
    '#ED757D',
    '#E8525D',
    '#E22734',
    '#B51F2A',
    '#911922',
    '#74141B',
    '#5D1016',
    '#4A0D12',
  ],
  torchRed: [
    '#FDA5B1',
    '#FD8E9D',
    '#FC7284',
    '#FB4F65',
    '#FA233E',
    '#C81C32',
    '#A01628',
    '#801220',
    '#660E1A',
    '#520B15',
  ],
  /* eslint-enable sort-keys/sort-keys-fix */
};
