import { expect } from '@wdio/globals';
import { products } from '../src/data/products';
import { catalog } from '../src/screens/CatalogScreen';
import { startFresh } from '../src/workflows/app';
import { sortCatalog } from '../src/workflows/shopping';

// Names are compared by character code, the same ordering the app's database
// uses, rather than with localeCompare.
const ascending = (names: string[]) => [...names].sort();
const descending = (names: string[]) => [...names].sort().reverse();

describe('Catalog sorting', () => {
  beforeEach(async () => {
    await startFresh();
  });

  it('sorts by price, lowest first', async () => {
    await sortCatalog('priceAscending');
    await catalog.waitForFirstProduct(products.onesie.name);

    const prices = await catalog.visiblePricesInCents();
    expect(prices[0]).toBe(products.onesie.priceCents);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('sorts by name, Z to A', async () => {
    await sortCatalog('nameDescending');
    await catalog.waitForFirstProduct('Test.allTheThings() T-Shirt (yellow)');

    const names = await catalog.visibleProductNames();
    expect(names).toEqual(descending(names));
  });

  it('goes back to A to Z after another order was chosen', async () => {
    await sortCatalog('nameDescending');
    await catalog.waitForFirstProduct('Test.allTheThings() T-Shirt (yellow)');

    await sortCatalog('nameAscending');
    await catalog.waitForFirstProduct(products.backpack.name);

    const names = await catalog.visibleProductNames();
    expect(names).toEqual(ascending(names));
  });
});
