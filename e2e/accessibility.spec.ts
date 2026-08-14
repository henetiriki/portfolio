import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import {
  CONTENT_ROUTES,
  blockGoogleMaps,
  waitForHydration,
} from './support/helpers';

/**
 * One axe pass per page template. Deliberately not per component — the unit
 * suite covers component structure, whereas this catches whole-page problems
 * that only exist once real CSS is applied: contrast against the fixed
 * background photo, landmark structure, and duplicated ids after hydration.
 *
 * The tag list includes `best-practice` as well as WCAG — see
 * docs/development.md#browser-regression-suite.
 */
test.describe('accessibility', () => {
  for (const { path } of CONTENT_ROUTES) {
    test(`${path} has no detectable axe violations`, async ({ page }) => {
      await blockGoogleMaps(page);
      await page.goto(path);

      await waitForHydration(page);

      const { violations } = await new AxeBuilder({ page })
        .withTags(['best-practice', 'wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        // Third-party frames are excluded because their markup is not ours to
        // fix. The experience page embeds a YouTube player whose own DOM trips
        // aria-allowed-attr, aria-prohibited-attr and button-name; including it
        // would make this check permanently red and therefore ignored.
        .exclude('iframe')
        .analyze();

      expect(
        violations.map(({ id, nodes }) => `${id} (${nodes.length})`)
      ).toEqual([]);
    });
  }
});
