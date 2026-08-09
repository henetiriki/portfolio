import { Content, Header } from '@components/content';
import { ContactForm } from '@components/form';
import { Seo } from '@components/shared';
import { description } from '@fixtures/contact';
import type { NextPage } from 'next';
import type { JSX } from 'react';

const Contact: NextPage = (): JSX.Element => (
  <>
    <Seo description={description} path='/contact' title='Contact' />
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
