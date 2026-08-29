import { Flex, Space, Text, Title } from '@mantine/core';
import { IconGlobe, IconPlaneDeparture, IconPlus } from '@tabler/icons-react';
import type { Job, School } from '@fixtures/types';

export const jobs: Job[] = [
  {
    content: (
      <Text component='p'>
        I’m excited to start this next chapter as a{' '}
        <b>Software Engineer (Front-end)</b> with{' '}
        <b>Equal Experts South Africa</b> — joining their remote-first
        consultancy network from the Garden Route.
      </Text>
    ),
    institution: {
      location: (
        <>
          Garden Route, South Africa <span>(remote)</span>
        </>
      ),
      name: 'Equal Experts',
      url: 'https://www.equalexperts.com/',
    },
    title: 'Software Engineer (Front-end)',
    year: {
      from: 'September 2026',
      to: 'Present',
    },
  },
  {
    accomplishments: (
      <>
        <Title order={4} size='h5'>
          Accomplishments
        </Title>
        <Text component='p'>
          I took the practice’s admin workflow from six disconnected manual
          processes to one integrated desktop tool within a single quarter.
        </Text>
        <Text component='p'>
          I also kept a human in the loop on client-facing communication:
          AI-drafted emails land as a <b>Microsoft Graph API</b> draft in the
          practice owner’s Outlook mailbox rather than sending automatically.
        </Text>
      </>
    ),
    content: (
      <>
        <Text component='p'>
          I joined CSA Architects, a founder-led architecture practice,
          initially as an operations assistant. The role quickly evolved into a
          hybrid <b>business analyst</b> and <b>product owner</b> position: I
          identified recurring manual admin bottlenecks across the practice and
          directed the design and build of a desktop automation suite to
          eliminate them.
        </Text>
        <Text component='p'>
          The application itself was built in <b>Python</b> with a{' '}
          <b>Tkinter</b> interface, developed using AI-assisted tooling (
          <b>Claude</b> and <b>Codex</b>) — despite having no prior Python
          background, I wrote the specifications, reviewed the generated code,
          and tested iteratively against real project data. It integrates with{' '}
          <b>Toggl</b> for time tracking, <b>Xero</b> for invoicing and
          statements via a custom-built template, <b>Mitti</b> for site
          inspections, the <b>Microsoft Graph API</b> to draft client emails
          directly into the practice owner’s Outlook mailbox, and the{' '}
          <b>OpenAI API</b> for generating meeting minutes from transcripts and
          drafting weekly client updates. It also auto-fills repetitive
          legislative and municipal <b>PDF forms</b> from centrally captured
          project metadata.
        </Text>
      </>
    ),
    institution: {
      location: 'Mossel Bay, South Africa',
      name: 'CSA Architects',
      url: 'https://www.csarc.co.za',
    },
    title: (
      <>
        Technical Business Analyst / Solutions Developer <span>(contract)</span>
      </>
    ),
    year: {
      from: 'June 2026',
      to: 'August 2026',
    },
  },
  {
    content: (
      <>
        <Text component='p'>
          <b>Objective</b>: Executed a planned career pivot and sabbatical,
          taking time to focus on family while completing long-delayed travel
          plans.
        </Text>
        <Text component='p'>
          <b>Travel</b>: Achieved a lifelong goal of navigating diverse
          environments in Chile, Argentina and Patagonia, which broadened my
          cultural fluency and adaptability.
        </Text>
        <Text component='p'>
          <b>Preparation</b>: Completed a relocation to South Africa after more
          than 14 years in New Zealand, settling into the Garden Route ahead of
          returning to remote-first software delivery work.
        </Text>
      </>
    ),
    institution: {
      location: 'South Africa, Chile, Argentina',
      name: 'Career break',
    },
    title: 'International Travel & Family Priorities',
    year: {
      from: 'November 2025',
      to: 'May 2026',
    },
  },
  {
    content: (
      <>
        <Text component='p'>
          Worked in a team tasked with replacing a bespoke BNZ deposit and home
          lending pricing application.
        </Text>
        <Text component='p'>
          The <b>React</b> UI, built using BNZ’s mini-app (
          <b>micro-front-end</b>) pattern, interfaced with a BNZ microservice,
          which in turn integrated with an external system. The application
          required <b>user access management</b> with different screens for
          various user roles to be implemented via AD groups. Other technologies
          included <b>TanStack query</b> (React query) and a bespoke UI library.
        </Text>
      </>
    ),
    institution: {
      location: 'Wellington, New Zealand',
      name: 'BNZ',
      url: 'https://www.bnz.co.nz',
    },
    title: (
      <>
        Senior Front-end Developer <span>(contract)</span>
      </>
    ),
    year: {
      from: 'April 2025',
      to: 'October 2025',
    },
  },
  {
    accomplishments: (
      <>
        <Title order={4} size='h5'>
          Accomplishments
        </Title>
        <Text component='p'>
          I built a flexible and customisable template configuration setup that
          will enable new data collection flows to be rolled out quickly in
          future.
        </Text>
        <Text component='p'>
          I also assisted QA in setting up Playwright as the E2E test framework,
          including the use of Playwright Axe for accessibility coverage.
        </Text>
      </>
    ),
    content: (
      <>
        <Text component='p'>
          I was embedded in a delivery team on TEC’s Data Systems Refresh (DSR)
          programme working on data collections (Commitments &amp; Actuals) from
          Tertiary Education Organisations (TEOs), which in turn supports the
          allocation of funding to the education sector.
        </Text>
        <Text component='p'>
          Technologies included <b>Angular</b>, <b>Angular Material</b> and a C#
          backend with an SQL database. <b>GitHub Actions</b> was the CI/CD in
          use with <b>Playwright</b> used as the E2E framework. The stack was
          deployed on <b>Azure</b> infrastructure.
        </Text>
      </>
    ),
    institution: {
      location: <>Wellington, New Zealand</>,
      name: 'Tertiary Education Commission',
      url: 'https://tec.govt.nz/',
    },
    title: (
      <>
        Senior Front-end Developer <span>(contract)</span>
      </>
    ),
    year: {
      from: 'October 2023',
      to: 'February 2025',
    },
  },
  {
    accomplishments: (
      <>
        <Title order={4} size='h5'>
          Accomplishments
        </Title>
        <Text component='p'>
          One of my own objectives was <b>mentoring</b> team members on good{' '}
          <b>SDLC</b> practices and continuous improvement — breaking stories
          down into small, releasable chunks, writing testable code and focusing
          on a WIP limit.
        </Text>
      </>
    ),
    content: (
      <>
        <Text component='p'>
          I worked as part of a <b>distributed team</b> across multiple time
          zones within the <b>Customer Tribe</b> at Pet Circle. The main focus
          was the conversion of occasional shoppers into returning customers via
          an <b>Auto Delivery</b> service.
        </Text>
        <Text component='p'>
          The <b>E-commerce platform</b> used a variety of technologies,
          including <b>Preact</b>. CI/CD consisted of a combination of{' '}
          <b>Jenkins</b> and <b>GitHub Actions</b>. The stack ran on{' '}
          <b>Google Cloud Platform</b>.
        </Text>
        <Text component='p'>
          <b>SEO</b> and <b>conversion metrics</b> were very important. Google{' '}
          <b>Optimize</b> and <b>Tag Manager</b> were used to great effect to
          perform <b>A/B experiments</b> and ultimately picking the best
          outcomes for the business.
        </Text>
      </>
    ),
    institution: {
      location: (
        <>
          Sydney, Australia <span>(remote)</span>
        </>
      ),
      name: 'Pet Circle',
      url: 'https://www.petcircle.com.au',
    },
    title: 'Senior Front-end Developer',
    year: {
      from: 'May 2022',
      to: 'October 2023',
    },
  },
  {
    accomplishments: (
      <>
        <Title order={4} size='h5'>
          Accomplishments
        </Title>
        <Text component='p'>
          My team delivered a front-end React application hosted as an{' '}
          <b>Amazon S3 static site</b>. This single page application formed part
          of a larger project required to meet the obligations of new lending
          and borrowing legislation (CCCFA). We were able to deliver in advance
          of the delivery date, which in turn helped BNZ be compliant well
          before the government deadline.
        </Text>
      </>
    ),
    content: (
      <>
        <Text component='p'>
          I worked as a Senior Front-end Developer in an <b>agile team</b> at
          BNZ Digital, where I started on contract and then switched to
          permanent employment.
        </Text>
        <Text component='p'>
          The technology stack included, amongst others, <b>React</b>,{' '}
          <b>Cypress</b>, <b>OpenShift</b> and <b>AWS</b>. The CI/CD tool was{' '}
          <b>Jenkins</b>.
        </Text>
        <Text component='p'>
          My team was involved in the development and maintenance of a bespoke
          React/Redux/RxJS form rendering library used across multiple projects
          at BNZ. This library, along with a supporting API, enabled Marketing
          and Sales, and even other delivery teams, to quickly and easily
          create, publish and maintain customer and staff facing forms across
          both <b>public</b> and <b>authenticated channels</b>.
        </Text>
      </>
    ),
    institution: {
      location: 'Wellington, New Zealand',
      name: 'BNZ',
      url: 'https://www.bnz.co.nz',
    },
    title: (
      <>
        Senior Front-end Developer <span>(contract/permanent)</span>
      </>
    ),
    year: {
      from: 'June 2019',
      to: 'April 2022',
    },
  },
  {
    content: (
      <>
        <Text component='p'>
          I worked at the Department of Internal Affairs, on behalf of
          Accenture, where the tech stack included <b>Angular (7)</b>,{' '}
          <b>Java Spring Boot</b>, <b>Node.js</b> and <b>MongoDB</b> running in{' '}
          <b>Azure</b>.
        </Text>
        <Text component='p'>
          As part of a <b>digital delivery</b> team, I was involved in several
          core services provided to the NZ public. These included online{' '}
          <b>marriage licence</b> applications, <b>certificate ordering</b>,
          including birth, marriage, death, and a <b>citizenship pilot</b>.
          Project work involved integrations with <b>Payment Express</b>{' '}
          (PxPay), <b>RealMe</b> and other custom backend systems.
        </Text>
      </>
    ),
    institution: {
      location: 'Wellington, New Zealand',
      name: 'Accenture',
      url: 'https://www.accenture.com/nz-en',
    },
    title: (
      <>
        Full-stack Developer <span>(contract)</span>
      </>
    ),
    year: {
      from: 'July 2018',
      to: 'June 2019',
    },
  },
  {
    content: (
      <>
        <Text component='p'>
          I joined Stuff (Fairfax Media) as a <b>Full-Stack Engineer</b> in
          September 2017, and worked in a team focused on building a new
          curation tool to satisfy several specific editorial tasks.
        </Text>
        <Text component='p'>
          The application was written in <b>Typescript</b> using <b>Angular</b>{' '}
          and the <b>Angular Material Framework</b> (including <b>Jasmine</b>{' '}
          Unit tests and <b>Protractor</b> E2E tests), served via a{' '}
          <b>Node.js</b> back-end, which interfaced with various Stuff APIs,
          while deployed in a <b>Docker</b> container on <b>AWS</b>{' '}
          infrastructure. <b>CI/CD</b> and deployment happened as part of a{' '}
          <b>Concourse</b> pipeline.
        </Text>
        <Text component='p'>
          I also worked on an integration with <b>IBM Watson NLU</b> to enable
          content categorisation via keywords/entities, which was then ingested
          into an <b>Elasticsearch</b> database and used in a “Related Content”
          service.
        </Text>
      </>
    ),
    institution: {
      location: 'Wellington, New Zealand',
      name: 'Stuff',
      url: 'https://www.stuff.co.nz',
    },
    title: 'Full-stack Engineer',
    year: {
      from: 'September 2017',
      to: 'July 2018',
    },
  },
  {
    content: (
      <>
        <Text component='p'>
          I completed a contract assignment with Fairfax Media as a{' '}
          <b>JavaScript Developer</b> in one of the Wellington-based development
          teams.
        </Text>
        <Text component='p'>
          I was closely involved in the implementation of a new{' '}
          <b>React-based</b> front-end for the <i>Stuff.co.nz</i> news site
          article pages. The application, including the back-end interfaces like{' '}
          <b>GraphQL</b>, was served via <b>Express</b> in a <b>Node.js</b>{' '}
          runtime.
        </Text>
        <Text component='p'>
          Other projects included the implementation of an implicit flow
          client-side <b>OpenID Connect</b> login, as well as integrating the{' '}
          <b>Nativform</b> (FFX Native platform) advertising SDK.
        </Text>
      </>
    ),
    institution: {
      location: 'Wellington, New Zealand',
      name: (
        <>
          Fairfax Media <span>(now Stuff)</span>
        </>
      ),
      url: 'https://www.stuff.co.nz',
    },
    title: (
      <>
        JavaScript Developer <span>(contract)</span>
      </>
    ),
    year: {
      from: 'April 2016',
      to: 'June 2017',
    },
  },
  {
    content: (
      <>
        <Text component='p'>
          I worked as a <b>UI Developer</b> at Westpac NZ, where I was involved
          in various projects, including{' '}
          <b>
            <i>Direct from Account&trade;</i>
          </b>
          ,{' '}
          <b>
            <i>Westpac Exchange&trade;</i>
          </b>{' '}
          and{' '}
          <b>
            <i>Westpac One&reg;</i>
          </b>
          {''}.
        </Text>
        <Text component='p'>
          The server-side development environment was <b>Java</b>, while the
          client-side was built using a variety of{' '}
          <b>JavaScript technologies</b> and <b>frameworks</b>, most notably{' '}
          <b>Backbone</b>, Marionette, <b>Underscore</b>, <b>RequireJS</b>,{' '}
          <b>AngularJS</b>, SCSS, and, during development, <b>Node.js</b>.
        </Text>
        <Text component='p'>
          Build and Testing tools included <b>Grunt</b>, Maven, Jenkins, JUnit,
          Cucumber, <b>Jasmine</b> and <b>Karma</b>.
        </Text>
      </>
    ),
    institution: {
      location: 'Wellington, New Zealand',
      name: 'Westpac NZ Ltd',
      url: 'https://www.westpac.co.nz',
    },
    title: 'Front-end Developer',
    year: {
      from: 'June 2014',
      to: 'March 2016',
    },
  },
  {
    accomplishments: (
      <>
        <Title order={4} size='h5'>
          Accomplishments
        </Title>
        <Text component='p'>
          I worked alongside members of the hardware team on the implementation
          of a <b>RESTful JSON</b> communication protocol over HTTP for the 2nd
          Generation Onboard Units.
        </Text>
      </>
    ),
    content: (
      <>
        <Text component='p'>
          I was employed as a Java Developer at EROAD, New Zealand’s leading
          transport technology and services company. I worked in an{' '}
          <b>Agile environment</b> developing and unit testing enhancements,
          which involved user <b>interfaces</b>, <b>web services</b> and{' '}
          <b>back-end integrations</b> for EROAD’s{' '}
          <b>cloud-based SaaS application</b>.
        </Text>
        <Text component='p'>
          The development environment was <b>Java</b>, and frameworks and
          technologies included <b>Spring MVC</b>, <b>JSP</b>, <b>JQuery</b>,{' '}
          <b>RESTful</b> web services over <b>HTTP</b>, <b>JAX-WS/JAXB</b> web
          services over <b>SOAP</b>,<b>Hibernate</b> and <b>PostgreSQL</b>.
        </Text>
        <Text component='p'>
          I mainly functioned within the Tax and Localisation team, which
          included the <b>GIS</b> and mapping layer.
        </Text>
      </>
    ),
    institution: {
      location: 'Auckland, New Zealand',
      name: 'EROAD',
      url: 'https://www.eroad.co.nz',
    },
    title: 'Senior Java Developer',
    year: {
      from: 'January 2013',
      to: 'April 2014',
    },
  },
  {
    accomplishments: (
      <>
        <Title order={4} size='h5'>
          Accomplishments
        </Title>
        <Text component='p'>
          I was involved in a major overhaul of the UI for the PPM System,
          which, amongst other tasks, included the implementation of a{' '}
          <b>WYSIWYG editor</b> inside GWT. I worked with my team in New Zealand
          alongside teams in the US and China to rebuild the data collection
          component.
        </Text>
      </>
    ),
    content: (
      <>
        <Text component='p'>
          I worked as a Software Developer at the New Zealand campus of Rockwell
          Automation. I functioned within an <b>agile team</b> developing{' '}
          <b>user interface elements</b> as well as <b>web services</b> and{' '}
          <b>back-end integrations</b> for a performance management platform
          (PPM) used in a variety of industries worldwide. The deployment of
          this <b>multi-tier application</b> consisted of<b>Tomcat</b> &amp;{' '}
          <b>JBoss</b> on the <b>Java EE</b> technology stack.
        </Text>
        <Text component='p'>
          The development environment was <b>Java</b>, utilising third-party
          technologies such as <b>GWT</b>, to deliver a rich user experience.
        </Text>
      </>
    ),
    institution: {
      location: 'Hamilton, New Zealand',
      name: 'Rockwell',
      url: 'https://www.rockwellautomation.com/en-nz.html',
    },
    title: 'Software Developer',
    year: {
      from: 'July 2011',
      to: 'December 2012',
    },
  },
  {
    accomplishments: (
      <>
        <Title order={4} size='h5'>
          Accomplishments
        </Title>
        <Text component='p'>
          I integrated an open-source <b>mobile framework</b> (WURFL) into the
          Quirk software stack, which enabled the development of mobile client
          solutions. I converted <b>Google’s server-side JSP tracking</b> code
          to fit into the Quirk stack and WebWork framework.
        </Text>
        <Text component='p'>
          I developed a <b>live tracking solution</b> of a colleague’s mountain
          bike race via <b>GPS</b>, Vodacom API and <b>Google Maps API</b>.
        </Text>
      </>
    ),
    content: (
      <>
        <Text component='p'>
          I worked as a Software Engineer at the Cape Town office of Quirk
          developing <b>Java</b> (<b>Java EE</b>) <b>web-based applications</b>{' '}
          to client specifications within specified deadlines. Projects included{' '}
          <b>SEO optimised websites</b> and <b>mobile websites</b>,{' '}
          <b>custom-built CMS</b> solutions, <b>Facebook Applications</b>,
          integrations with <b>Twitter</b> and other <b>3rd party APIs</b>,{' '}
          <b>RSS Feeds</b> (both generating and parsing).
        </Text>
        <Text component='p'>
          The development environment was <b>Java</b>, utilising the{' '}
          <b>MVC WebWork</b> framework and <b>Freemarker Template</b> engine,
          backed by <b>Spring</b>, <b>MySQL</b> and <b>Hibernate</b>.
        </Text>
        <Text component='p'>
          Other duties included the maintenance and support of existing
          applications, interfacing with clients regularly for presentations and
          training, the compilation of client-facing documentation, where
          required and performing on-call server monitoring.
        </Text>
      </>
    ),
    institution: {
      location: 'Cape Town, South Africa',
      name: (
        <>
          Quirk <span>(now Wunderman Thompson)</span>
        </>
      ),
      url: 'https://www.wundermanthompson.com/south-africa',
    },
    title: 'Software Engineer',
    video: {
      videoTitle: 'Team Quirk Live Tracker',
      videoUrl: 'https://www.youtube.com/embed/34Tb79-2ekc?rel=0',
    },
    year: {
      from: 'November 2008',
      to: 'April 2011',
    },
  },
  {
    content: (
      <Text component='p'>
        I worked as part of a team that developed <b>Java ME</b> applications
        for <b>embedded systems</b>. I was also involved with the server-side
        software and mobile sites supporting the download and installation
        thereof. Other duties included the maintenance of existing software.
      </Text>
    ),
    institution: {
      location: 'Cape Town, South Africa',
      name: 'Cellsmart',
    },
    title: 'Java Developer',
    year: {
      from: 'February 2008',
      to: 'October 2008',
    },
  },
  {
    content: (
      <>
        <Space h='lg' />
        <Flex align='center' justify='flex-start' w='100%'>
          <IconPlaneDeparture size={25} />
          <Space w='md' />
          <IconPlus size={15} />
          <Space w='md' />
          <IconGlobe size={25} />
        </Flex>
      </>
    ),
    institution: {
      location: 'Cape Town & Johannesburg, South Africa',
      name: 'South African Airways',
    },
    title: 'Flight Attendant',
    year: {
      from: 'December 1997',
      to: 'January 2006',
    },
  },
];

export const schools: School[] = [
  {
    content: (
      <Text component='p'>
        Java SE/EE;
        <br />
        Linux Red Hat;
        <br />
        Processing and Logic concepts;
        <br />
        Program Design;
        <br />
        Software Engineering;
        <br />
        Relational Database &amp; Modelling Design;
        <br />
        SQL Server 2000;
        <br />
        Linux Administration;
      </Text>
    ),
    institution: {
      location: 'Cape Town, South Africa',
      name: 'CTI',
      url: 'https://en.wikipedia.org/wiki/CTI_Education_Group',
    },
    qualification: 'Certificate in Information Systems',
    year: {
      from: '2006',
      to: '2007',
    },
  },
];
