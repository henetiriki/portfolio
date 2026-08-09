import { bodyFont, headingFont } from '@styles/fonts';

describe('font definitions', () => {
  it('provides generated body and heading font families', () => {
    expect(bodyFont.style.fontFamily).toBeTruthy();
    expect(headingFont.style.fontFamily).toBeTruthy();
  });
});
