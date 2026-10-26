import type { Product } from '../data/products';
import { cart } from '../screens/CartScreen';
import { catalog } from '../screens/CatalogScreen';
import { header } from '../screens/HeaderBar';
import { menu } from '../screens/MenuDrawer';
import { productDetail } from '../screens/ProductDetailScreen';
import { sortDialog, type SortOrder } from '../screens/SortDialog';

export async function openProduct(product: Product): Promise<void> {
  await catalog.openProduct(product.name);
  await productDetail.waitForIsShown();
}

/**
 * Adds a product from the catalog and confirms the cart badge went up by the
 * quantity, then goes back to the catalog through the menu. (The Back button
 * would show a stale badge; see tests/known-defects.)
 */
export async function addToCart(product: Product, quantity = 1): Promise<void> {
  const countBefore = await header.cartCount();
  await openProduct(product);
  await productDetail.setQuantity(quantity);
  await productDetail.addToCart();
  await header.waitForCartCount(countBefore + quantity);
  await returnToCatalog();
}

export async function returnToCatalog(): Promise<void> {
  await header.openMenu();
  await menu.waitForIsShown();
  await menu.openCatalog();
  await catalog.waitForIsShown();
}

export async function sortCatalog(order: SortOrder): Promise<void> {
  await header.openSortOptions();
  await sortDialog.waitForIsShown();
  await sortDialog.choose(order);
}

export async function openCart(): Promise<void> {
  await header.openCart();
  await cart.waitForIsShown();
}
