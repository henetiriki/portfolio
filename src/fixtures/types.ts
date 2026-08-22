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

type PortfolioItemAction = {
  href: string;
  label: string;
};

type PortfolioItemImg = {
  alt: string;
  src: string;
};

export type PortfolioItem = {
  action?: PortfolioItemAction;
  content: JSX.Element;
  href?: string;
  img: PortfolioItemImg;
  title: string;
};
