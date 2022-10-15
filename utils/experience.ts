import { getNodeText } from '@utils/common';
import type { Job } from '@fixtures/types';

const getUniqueValues = (jobs: Job[]): string[] => {
  const employers = new Set<string>();
  const positions = new Set<string>();

  jobs.forEach(({ institution: { name }, title }: Job) => {
    employers.add(getNodeText(name));
    positions.add(
      getNodeText(title)
        .replaceAll(/\(.*\)/g, '')
        .trim()
    );
  });

  return [...Array.from(employers), ...Array.from(positions)];
};

export const getExperienceDescription = (jobs: Job[]): string =>
  getUniqueValues(jobs).join(', ');

export const getExperienceKeywords = (jobs: Job[]): string =>
  getUniqueValues(jobs).join(' ').toLowerCase();
