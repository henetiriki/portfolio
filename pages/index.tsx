import { TypeAnimation } from 'react-type-animation';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  return (
    <div>
      <h1>Louw Swart</h1>
      <h4>
        I’m a{' '}
        <TypeAnimation
          sequence={[
            'front-end engineer',
            1000,
            'photographer',
            1000,
            'cat parent',
            1000,
            'plane spotter',
            1000,
            'traveller',
            1000,
          ]}
          speed={20}
          wrapper='span'
          repeat={Infinity}
        />
      </h4>
      <p>ex-flight attendant turned programmer</p>
    </div>
  );
};

export default Home;
