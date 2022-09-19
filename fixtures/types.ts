export type Job = {
  accomplishments?: JSX.Element;
  content: JSX.Element | null;
  institution: {
    location: string;
    name: string;
    url?: string;
  };
  title: string;
  video?: {
    videoTitle: string;
    videoUrl: string;
  };
  year: {
    from: string;
    to: string;
  };
};

export type LinkItem = {
  text: string;
  href: string;
};

export type School = {
  content: JSX.Element;
  institution: {
    location: string;
    name: string;
    url?: string;
  };
  qualification: string;
  year: {
    from: number;
    to: number;
  };
};
