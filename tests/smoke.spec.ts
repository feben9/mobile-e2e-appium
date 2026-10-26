import { expect } from '@wdio/globals';
import { catalog } from '../src/screens/CatalogScreen';
import { header } from '../src/screens/HeaderBar';
import { startFresh } from '../src/workflows/app';

// If these fail, nothing else in the suite can pass: the build does not
// install, does not start, or cannot load its product data.
describe('Smoke', () => {
  beforeEach(async () => {
    await startFresh();
  });

  it('launches into the product catalog with an empty cart', async () => {
    expect(await header.cartCount()).toBe(0);
    expect((await catalog.visibleProductNames()).length).toBeGreaterThan(0);
  });

  it('lists products with a name and a well-formed, positive price', async () => {
    const names = await catalog.visibleProductNames();
    // toCents() throws on anything that is not a clean dollar amount.
    const prices = await catalog.visiblePricesInCents();

    expect(names.length).toBeGreaterThanOrEqual(4);
    expect(names.filter((name) => name.trim() === '')).toEqual([]);
    expect(prices.filter((cents) => cents <= 0)).toEqual([]);
  });
});
