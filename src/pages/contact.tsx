import { Content, Header } from '@components/content';
import { ContactForm } from '@components/form';
import { Seo } from '@components/shared';
import type { NextPage } from 'next';
import type { JSX } from 'react';

const description =
  'Contact Louw Swart directly through the form on this page, or connect via GitHub, LinkedIn or Instagram to see code, work history and more.';

const Contact: NextPage = (): JSX.Element => (
  <>
    <Seo description={description} path='/contact' title='Get In Touch' />
    <>
      <Header>
        Get in touch<span>contact me to have a chat</span>
      </Header>
      <Content>
        <ContactForm />
      </Content>
    </>
  </>
);

export default Contact;
