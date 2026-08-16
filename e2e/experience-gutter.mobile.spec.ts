import { expect, test } from '@playwright/test';
import { blockGoogleMaps, waitForHydration } from './support/helpers';

/**
 * Mobile-only: the gutter this guards is only a problem where the screen is
 * narrow, and above the `xs` breakpoint the timeline goes back to its roomier
 * desktop spacing, where the ratio asserted below would legitimately fail.
 *
 * The left inset on `/experience` is built from five stacked layers, none of
 * them individually wrong, and it reached half the screen width before anyone
 * measured it. Nothing about any single layer looks excessive in isolation, so
 * this is checked as a property of the composition rather than as a set of
 * values — the same reason the assertions here are ratios and relationships,
 * not the pixel counts they happened to produce.
 *
 * The two alignment invariants are the reason a naive fix is dangerous: the
 * rail is drawn where the heading icon's centre falls, and the card's arrow
 * points into the gap the dot sits in. Either can be broken silently by an
 * edit that looks purely like spacing. See docs/decisions.md#d-260816k.
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
 * Walks the timeline structurally rather than by class name, so hashed CSS
 * Module names cannot silently detach these assertions from what they measure.
 *
 * Every step selects the first child `div` rather than `firstElementChild`:
 * Mantine renders responsive style props as a `<style>` element injected as the
 * first child of the element that carries them, which the simpler traversal
 * lands on instead.
 */
function measure(heading: string) {
  const title = [...document.querySelectorAll('h2')].find(
    element => element.textContent?.trim() === heading
  );
  const icon = title?.parentElement?.querySelector(':scope > div');
  const rail = title?.parentElement?.nextElementSibling;
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
