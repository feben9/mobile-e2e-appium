import { expect } from '@wdio/globals';
import { products } from '../src/data/products';
import { cart } from '../src/screens/CartScreen';
import { catalog } from '../src/screens/CatalogScreen';
import { header } from '../src/screens/HeaderBar';
import { formatCents, sumLines } from '../src/support/money';
import { startFresh } from '../src/workflows/app';
import { addToCart, openCart, sortCatalog } from '../src/workflows/shopping';

// The cart is where a pricing bug costs real money, so totals are checked
// against the unit prices on screen *and* against the known catalog prices,
// all in integer cents.
describe('Cart', () => {
  beforeEach(async () => {
    await startFresh();
  });

  it('shows the empty state before anything is added', async () => {
    await header.openCart();

    await expect(cart.emptyCartTitle).toBeDisplayed();
    await expect(cart.goShoppingButton).toBeDisplayed();
  });

  describe('with a backpack and two onesies', () => {
    const { backpack, onesie } = products;

    beforeEach(async () => {
      await addToCart(backpack, 1);
      // The Onesie is the first tile once the catalog is sorted by price.
      await sortCatalog('priceAscending');
      await catalog.waitForFirstProduct(onesie.name);
      await addToCart(onesie, 2);
      await openCart();
    });

    it('lists each product with its unit price and quantity', async () => {
      expect(await cart.line(backpack.name)).toEqual({
        name: backpack.name,
        unitPriceCents: backpack.priceCents,
        quantity: 1,
      });
      expect(await cart.line(onesie.name)).toEqual({
        name: onesie.name,
        unitPriceCents: onesie.priceCents,
        quantity: 2,
      });
    });

    it('totals the cart from unit prices and quantities', async () => {
      const lines = await cart.lines();
      const expectedTotal = backpack.priceCents + 2 * onesie.priceCents; // $45.97

      expect(sumLines(lines)).toBe(expectedTotal);
      expect(formatCents(await cart.totalInCents())).toBe(formatCents(expectedTotal));
      expect(await cart.itemCount()).toBe(3);
      expect(await header.cartCount()).toBe(3);
    });

    it('recalculates the total when a quantity changes in the cart', async () => {
      await cart.increaseQuantity(backpack.name);
      await cart.waitForItemCount(4);

      const expectedTotal = 2 * backpack.priceCents + 2 * onesie.priceCents; // $75.96
      expect(formatCents(await cart.totalInCents())).toBe(formatCents(expectedTotal));
      expect((await cart.line(backpack.name)).quantity).toBe(2);
      expect(await header.cartCount()).toBe(4);
    });
  });
});
