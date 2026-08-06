import {
  getExperienceDescription,
  getExperienceKeywords,
} from '@utils/experience';
import type { Job } from '@fixtures/types';

const buildJob = (overrides: Partial<Job>): Job => ({
  content: null,
  institution: { location: 'Nowhere', name: 'Acme' },
  title: 'Engineer',
  year: { from: '2020', to: '2021' },
  ...overrides,
});

const jobs: Job[] = [
  buildJob({
    institution: { location: 'Wellington', name: 'BNZ' },
    title: 'Senior Front-end Developer (contract)',
  }),
  buildJob({
    institution: { location: 'Sydney', name: 'Pet Circle' },
    title: 'Senior Front-end Developer',
  }),
  buildJob({
    institution: { location: 'Wellington', name: 'BNZ' },
    title: 'Full-stack Engineer',
  }),
];

describe('getExperienceDescription', () => {
  it('lists unique employers followed by unique positions (parenthetical suffixes stripped)', () => {
    expect(getExperienceDescription(jobs)).toBe(
      'BNZ, Pet Circle, Senior Front-end Developer, Full-stack Engineer'
    );
  });
});

describe('getExperienceKeywords', () => {
  it('lowercases and space-separates the same unique values', () => {
    expect(getExperienceKeywords(jobs)).toBe(
      'bnz pet circle senior front-end developer full-stack engineer'
    );
  });
});
