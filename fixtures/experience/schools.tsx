import { Text } from '@nextui-org/react';
import { School } from './types';

export const schools: School[] = [
  {
    content: (
      <>
        <Text>
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
