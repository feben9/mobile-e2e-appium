import { expect } from '@wdio/globals';
import { products } from '../src/data/products';
import { catalog } from '../src/screens/CatalogScreen';
import { header } from '../src/screens/HeaderBar';
import { productDetail } from '../src/screens/ProductDetailScreen';
import { startFresh } from '../src/workflows/app';
import { openProduct } from '../src/workflows/shopping';

describe('Product detail', () => {
  const product = products.backpack;

  beforeEach(async () => {
    await startFresh();
  });

  it('shows the same name and price as the catalog tile', async () => {
    const tilePrice = await catalog.priceOf(product.name);

    await openProduct(product);

    await expect(productDetail.name).toHaveText(product.name);
    expect(await productDetail.priceInCents()).toBe(tilePrice);
    expect(tilePrice).toBe(product.priceCents);
  });

  it('adds the chosen quantity to the cart', async () => {
    await openProduct(product);
    expect(await productDetail.quantity()).toBe(1);

    await productDetail.setQuantity(3);
    await productDetail.addToCart();

    await header.waitForCartCount(3);
  });

  it('disables Add to cart when the quantity is stepped down to zero', async () => {
    await openProduct(product);

    await productDetail.setQuantity(0);

    await expect(await productDetail.addToCartButton()).toBeDisabled();
    await productDetail.setQuantity(1);
    await expect(await productDetail.addToCartButton()).toBeEnabled();
  });
});
