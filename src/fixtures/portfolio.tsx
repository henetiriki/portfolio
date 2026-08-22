import type { PortfolioItem } from '@fixtures/types';

export const portfolioItems: PortfolioItem[] = [
  {
    content: (
      <>
        <span>Squarespace + Acuity Integration</span>
        <br />
        <br />A sophisticated web design for a Registered Nurse-led clinic based
        in Brisbane, Australia. I implemented a custom <b>Squarespace</b> layout
        and paired it with <b>Acuity Scheduling</b> engine to manage aesthetic
        consultations, deposit payments, and automated client workflows.
      </>
    ),
    href: 'https://www.beautywithin.au',
    img: {
      alt: 'Beauty WithIn website homepage — Squarespace site built for a Brisbane aesthetics clinic',
      src: '/images/portfolio/www.beautywithin.au.jpg',
    },
    title: 'Beauty WithIn',
  },
  {
    content: (
      <>
        <span>Minimalist Squarespace Build</span>
        <br />
        <br />A digital portfolio for a South African architecture firm. Using{' '}
        <b>Squarespace</b>, I built a clean, responsive interface that balances
        project portfolios with technical service descriptions. The result is a
        high-end, functional site that aligns with the client’s brand of
        “simplistic and smart design”.
      </>
    ),
    href: 'https://www.csarc.co.za',
    img: {
      alt: 'CSA Architects website homepage — Squarespace portfolio site for a South African architecture firm',
      src: '/images/portfolio/www.csarc.co.za.jpg',
    },
    title: 'CSA Architects',
  },
  {
    action: {
      href: '/contact',
      label: 'Let’s Chat',
    },
    content: (
      <>
        <span>Is Your Brand Next?</span>
        <br />
        <br />
        I’ve helped aesthetics clinics and architects level up their digital
        game. Now it’s your turn. Secure your spot in my portfolio and let’s
        build your new <b>Squarespace</b> home.
      </>
    ),
    img: {
      alt: 'Placeholder graphic for an upcoming portfolio project — reserved website slot',
      src: '/images/portfolio/coming_soon.jpg',
    },
    title: 'Reserved for You',
  },
];
