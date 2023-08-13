import {
  faGlobeAfrica,
  faPlaneDeparture,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { Box, Space, Text } from '@mantine/core';
import dynamic from 'next/dynamic';
import type { Job, School } from '@fixtures/types';

const DynamicFontAwesomeIcon = dynamic(
  () =>
    import('@fortawesome/react-fontawesome').then(mod => mod.FontAwesomeIcon),
  {
    ssr: false,
  }
);

export const description = 'Work and education history';

export const jobs: Job[] = [
  {
    content: (
      <>
        <Text component='p'>
          I work as part of a <b>distributed team</b> across multiple timezones
          within the <b>Customer Tribe</b> at Pet Circle. Our main focus is the
          conversion of occasional shoppers into returning customers via an{' '}
          <b>Auto Delivery</b> service.
        </Text>
        <Text component='p'>
          The <b>E-commerce platform</b> uses a variety of technologies,
          including <b>Preact</b>. CI/CD consists of a combination of{' '}
          <b>Jenkins</b> and <b>GitHub Actions</b>. The stack runs on{' '}
          <b>Google Cloud Platform</b>.
        </Text>
        <Text component='p'>
          <b>SEO</b> and <b>conversion metrics</b> are very important. Google{' '}
          <b>Optimize</b> and <b>Tag Manager</b> are used to great effect to
          perform <b>A/B experiments</b> and pick the best outcomes for the
          business.
        </Text>
        <Text component='p'>
          One of my own objectives has been <b>mentoring</b> team members on
          good <b>SDLC</b> practices and continuous improvement - breaking
          stories down into small, releasable chunks, writing testable code and
          focusing on a WIP limit.
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
      to: 'Present',
    },
  },
  {
    accomplishments: (
      <Text component='p'>
        My team delivered a front-end React application hosted as an{' '}
        <b>Amazon S3 static site</b>. This single page application formed part
        of a larger project required to meet the obligations of new lending and
        borrowing legislation (CCCFA). We were able to deliver in advance of the
        delivery date, which in turn helped BNZ be compliant well before the
        government deadline.
      </Text>
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
          September 2017 and worked in a team focused on building a new curation
          tool to satisfy several specific editorial tasks.
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
          I was closely involved in the implementation of a new <b>React</b>
          -based front-end for the <i>Stuff.co.nz</i> news site article pages.
          The application, including the back-end interfaces like <b>GraphQL</b>
          , was served via <b>Express</b> in a <b>Node.js</b> runtime.
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
          .
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
      <Text component='p'>
        I worked alongside members of the hardware team on the implementation of
        a <b>RESTful JSON</b> communication protocol over HTTP for the 2nd
        Generation Onboard Units.
      </Text>
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
        <Text component='p'>
          I was involved in a major overhaul of the UI for the PPM System,
          which, amongst other tasks, included the implementation of a{' '}
          <b>WYSIWYG editor</b> inside GWT. I worked with my team in New Zealand
          alongside teams in the US and China to re-build the data collection
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
          this <b>multi-tier application</b> consisted of a web environment (
          <b>Tomcat</b> &amp; <b>JBoss</b>), on the{' '}
          <b>Java EE technology stack</b>.
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
        <Text component='p'>
          I integrated an open-source <b>mobile framework</b> (WURFL) into the
          Quirk software stack which enabled the development of mobile client
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
          Other duties included maintenance and support of existing
          applications, interfacing with clients regularly for presentations and
          training, the compilation of client-facing documentation where
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
        thereof. Other duties included maintenance of existing software.
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
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'flex-start',
            width: '100%',
          }}>
          <Box
            sx={{
              '& svg': {
                height: '25px',
                width: '25px',
              },
            }}>
            <DynamicFontAwesomeIcon icon={faPlaneDeparture} size='2xs' />
          </Box>
          <Space w='md' />
          <Box
            sx={{
              '& svg': {
                height: '15px',
                width: '15px',
              },
            }}>
            <DynamicFontAwesomeIcon
              alignmentBaseline='middle'
              icon={faPlus}
              size='2xs'
            />
          </Box>
          <Space w='md' />
          <Box
            sx={{
              '& svg': {
                height: '25px',
                width: '25px',
              },
            }}>
            <DynamicFontAwesomeIcon icon={faGlobeAfrica} size='2xs' />
          </Box>
        </Box>
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
      <>
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
      </>
    ),
    institution: {
      location: 'Cape Town, South Africa',
      name: 'CTI',
      url: 'https://en.wikipedia.org/wiki/CTI_Education_Group',
    },
    qualification: 'Comprehensive Programming',
    year: {
      from: 2006,
      to: 2007,
    },
  },
];
