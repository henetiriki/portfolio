import type { JSX } from 'react';

export type ErrorMessage = {
  code: string;
  message: JSX.Element;
};

export type Year = {
  from: string;
  to: string;
};

export type Institution = {
  location: JSX.Element | string;
  name: JSX.Element | string;
  url?: string;
};

export type Video = {
  videoTitle: string;
  videoUrl: string;
};

export type Job = {
  accomplishments?: JSX.Element;
  content: JSX.Element | null;
  institution: Institution;
  title: JSX.Element | string;
  video?: Video;
  year: Year;
};

export type LinkItem = {
  href: string;
  text: string;
};

export type School = {
  content: JSX.Element;
  institution: Institution;
  qualification: string;
  year: Year;
};

export type SocialLink = {
  icon: JSX.Element;
  title: string;
  url: string;
};

export type PortfolioItem = {
  action?: {
    href: string;
    label: string;
  };
  content: JSX.Element;
  imageUrl: string;
  title: string;
  url?: string;
};
