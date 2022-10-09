import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { Container, Text, styled } from '@nextui-org/react';
import Head from 'next/head';
import { Content, Header } from '@components/content';
import { MapWrapper, MarkerLegend, PolylineLegend } from '@components/travel';
import { colors } from '@styles/shared';
import {
  legendContainer,
  travelContainerBottom,
  travelContainerTop,
} from '@styles/travel';
import { fullTitle } from '@utils/head';
import type { NextPage } from 'next';

const { alizarin, flameRed, pineGreen, pumpkin, torchRed } = colors;

const LegendContainer = styled('div', legendContainer);

const Travel: NextPage = (): JSX.Element => (
  <>
    <Head>
      <title key='pageTitle'>{fullTitle('Travel')}</title>
    </Head>
    <>
      <Header>
        Places I’ve been
        <span>
          “you have brains in your head. you have feet in your shoes. you can
          steer yourself any direction you choose.” - dr. seuss
        </span>
      </Header>
      <Content wrapperPadding={{ padding: '0' }}>
        <Container css={travelContainerTop}>
          <Text h2>Travel history</Text>
        </Container>
        <MapWrapper />
        <Container css={travelContainerBottom}>
          <Text css={{ pb: '$lg' }} h3>
            Legend
          </Text>
          <LegendContainer>
            <MarkerLegend color={torchRed} icon={faLocationDot}>
              current location
            </MarkerLegend>
            <MarkerLegend color={pumpkin} icon={faLocationDot}>
              past locations
            </MarkerLegend>
            <MarkerLegend color={pineGreen} icon={faLocationDot}>
              airports
            </MarkerLegend>
            <MarkerLegend color={alizarin} icon={faLocationDot}>
              stations
            </MarkerLegend>
            <MarkerLegend color={flameRed} icon={faLocationDot}>
              ports
            </MarkerLegend>
            <PolylineLegend color='$corn' style='solid'>
              flights
            </PolylineLegend>
            <PolylineLegend color='$torchRed' style='solid'>
              train rides
            </PolylineLegend>
            <PolylineLegend color='$viking' style='solid'>
              sailings
            </PolylineLegend>
            <PolylineLegend color='$corn' style='dotted'>
              upcoming flights
            </PolylineLegend>
            <PolylineLegend color='$torchRed' style='dotted'>
              upcoming train rides
            </PolylineLegend>
            <PolylineLegend color='$viking' style='dotted'>
              upcoming sailings
            </PolylineLegend>
          </LegendContainer>
        </Container>
      </Content>
    </>
  </>
);

export default Travel;
