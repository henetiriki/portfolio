import { expect, test } from '@playwright/test';
import { blockGoogleMaps } from './support/helpers';

test.describe('contact form', () => {
  test.beforeEach(async ({ page }) => {
    await blockGoogleMaps(page);

    // Never let the suite reach the real endpoint: submitting sends a genuine
    // email through Gmail SMTP.
    await page.route('**/api/contact', route =>
      route.fulfill({
        body: JSON.stringify({ data: 'Sent successfully' }),
        contentType: 'application/json',
        status: 200,
      })
    );

    await page.goto('/contact');
  });

  test('reaches every field and the submit control by keyboard in order', async ({
    page,
  }) => {
    await page.getByLabel('Name').focus();

    const order = ['Name', 'Email', 'Message'];

    for (const label of order.slice(1)) {
      await page.keyboard.press('Tab');
      await expect(page.getByLabel(label)).toBeFocused();
    }

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /send/i })).toBeFocused();
  });

  test('marks invalid fields with the error colour, not just error text', async ({
    page,
  }) => {
    await page.getByLabel('Name').fill('');
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByRole('button', { name: /send/i }).click();

    const email = page.getByLabel('Email');

    // `data-error` is the contract ContactForm.module.css keys its border
    // colour off. Asserting the computed border catches the exact regression
    // that shipped once before: visible error text with a grey border.
    await expect(email).toHaveAttribute('data-error', 'true');

    const borderColour = await email.evaluate(
      element => getComputedStyle(element).borderColor
    );

    expect(borderColour).not.toMatch(/rgba?\(255,\s*255,\s*255/);
    expect(borderColour).not.toBe('rgb(0, 0, 0)');
  });

  test('submits successfully against a mocked endpoint', async ({ page }) => {
    await page.getByLabel('Name').fill('Test Person');
    await page.getByLabel('Email').fill('test@example.test');
    await page.getByLabel('Message').fill('Hello from the browser suite.');
    await page.getByRole('button', { name: /send/i }).click();

    await expect(page.getByText(/sent|thank/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
