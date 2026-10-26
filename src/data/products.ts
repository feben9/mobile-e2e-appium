export interface Product {
  name: string;
  priceCents: number;
}

/**
 * Products the specs use, with prices from the app's seed data (2.3.0).
 *
 * Opening a product from the catalog crashes the app for the second tile and
 * for every tile after the sixth (an intentional defect in this demo app, see
 * tests/known-defects). These products sit in a safe slot: the Backpack is
 * first when sorted by name (the default), the Onesie is first by price.
 */
export const products = {
  backpack: { name: 'Sauce Labs Backpack', priceCents: 2999 },
  onesie: { name: 'Sauce Labs Onesie', priceCents: 799 },
  // Second tile in the default order; used only to reproduce the crash.
  greenBackpack: { name: 'Sauce Labs Backpack (green)', priceCents: 2999 },
} satisfies Record<string, Product>;

/** Flat delivery charge added on the review screen. */
export const DELIVERY_FEE_CENTS = 599;
