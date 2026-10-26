import { driver, expect } from '@wdio/globals';
import { shippingAddress } from '../../src/data/checkout';
import { products } from '../../src/data/products';
import { users } from '../../src/data/users';
import { catalog } from '../../src/screens/CatalogScreen';
import { header } from '../../src/screens/HeaderBar';
import { paymentForm } from '../../src/screens/PaymentScreen';
import { productDetail } from '../../src/screens/ProductDetailScreen';
import { startFresh } from '../../src/workflows/app';
import { enterShippingAddress, proceedToCheckoutAs } from '../../src/workflows/checkout';
import { addToCart, openCart, openProduct } from '../../src/workflows/shopping';

/**
 * Open defects in the app under test, found while reading its source and
 * reproduced by these specs. Each test states the behaviour a user should get,
 * so each one FAILS until the app is fixed.
 *
 * They run separately (`npm run test:known-defects`) so the main pipeline stays
 * a clean signal for regressions, while the defects stay visible and
 * reproducible instead of being skipped or deleted.
 */
describe('Known defects', () => {
  beforeEach(async () => {
    await startFresh();
  });

  // MainActivity refreshes the badge only when it is created, not when it is
  // resumed, so Back returns to a catalog that still shows the old count.
  it('shows the current cart count after Back from a product page', async () => {
    await openProduct(products.backpack);
    await productDetail.addToCart();
    await header.waitForCartCount(1);

    await driver.back();
    await catalog.waitForIsShown();

    expect(await header.cartCount()).toBe(1);
  });

  // CheckoutFragment reveals the card number's label instead of its error text
  // when the number is missing: the user gets an icon but no explanation.
  it('explains what is wrong when the card number is missing', async () => {
    await addToCart(products.backpack);
    await openCart();
    await proceedToCheckoutAs(users.standard);
    await enterShippingAddress(shippingAddress);

    await paymentForm.submit();

    await expect(paymentForm.errorFor('number')).toHaveText('Value looks invalid.');
  });

  // ProductCatalogFragment reads a per-tile value from a six-entry array whose
  // second entry is null: tile 2 throws a NullPointerException and tiles 7 and
  // up throw ArrayIndexOutOfBoundsException. Kept last because it crashes the app.
  it('opens the second product in the catalog', async () => {
    await catalog.openProduct(products.greenBackpack.name);

    await expect(productDetail.name).toHaveText(products.greenBackpack.name);
  });
});
