import { expect, test } from '@playwright/test';
import { blockGoogleMaps, waitForHydration } from './support/helpers';

/**
 * Mobile-only — see docs/development.md#browser-regression-suite for why
 * this is checked as a composition.
 */
const sections = ['Work History', 'Education'];

test.describe('experience timeline at mobile widths', () => {
  test.beforeEach(async ({ page }) => {
    await blockGoogleMaps(page);
    await page.goto('/experience');
    await waitForHydration(page);
  });

  for (const heading of sections) {
    test(`${heading}: gives body copy most of the screen`, async ({ page }) => {
      const { column, viewport } = await page.evaluate(measure, heading);

      // Half the screen was gutter before this was measured. Two thirds of the
      // width reaching the reader is the property worth holding; the exact
      // figure moves with any spacing change and is not the point.
      expect(column / viewport).toBeGreaterThan(0.6);
    });

    test(`${heading}: keeps the rail centred under its icon`, async ({
      page,
    }) => {
      const { iconCentre, railX } = await page.evaluate(measure, heading);

      // The rail's offset is an alignment constant, not slack. Reducing it
      // without moving the icon un-centres the two, and nothing else in the
      // suite would notice.
      expect(Math.abs(iconCentre - railX)).toBeLessThanOrEqual(1);
    });

    test(`${heading}: keeps the card's arrow clear of the dot`, async ({
      page,
    }) => {
      const { arrowLeft, dotRight } = await page.evaluate(measure, heading);

      // The arrow hangs outside the card, into the same gap the dot occupies,
      // so the gap has a floor that is invisible in the markup.
      expect(arrowLeft).toBeGreaterThanOrEqual(dotRight);
    });
  }
});

/**
 * Walks structurally, not by hashed CSS Module class name, filtering for
 * `div` to skip the geometry-less `<style>` tag Mantine's responsive props insert.
 */
function measure(heading: string) {
  const title = [...document.querySelectorAll('h2')].find(
    element => element.textContent?.trim() === heading
  );
  const icon = title?.parentElement?.querySelector(':scope > div');

  let rail = title?.parentElement?.nextElementSibling;

  while (rail && rail.tagName !== 'DIV') {
    rail = rail.nextElementSibling;
  }

  const box = rail?.querySelector(':scope > div');
  const card = box?.querySelector(':scope > div');

  if (!icon || !rail || !box || !card) {
    throw new Error(`No timeline found beneath "${heading}"`);
  }

  const iconRect = icon.getBoundingClientRect();
  const boxRect = box.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const cardStyle = getComputedStyle(card);
  const dot = getComputedStyle(box, '::after');
  const arrow = getComputedStyle(card, '::before');

  return {
    arrowLeft: cardRect.left - parseFloat(arrow.borderRightWidth),
    column:
      cardRect.width -
      parseFloat(cardStyle.paddingLeft) -
      parseFloat(cardStyle.paddingRight),
    dotRight: boxRect.left + parseFloat(dot.left) + parseFloat(dot.width),
    iconCentre: (iconRect.left + iconRect.right) / 2,
    railX: rail.getBoundingClientRect().left,
    viewport: window.innerWidth,
  };
}
