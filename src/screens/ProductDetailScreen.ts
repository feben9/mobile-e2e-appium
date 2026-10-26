import { $, browser } from '@wdio/globals';
import { toCents } from '../support/money';
import { byAccessibilityId, byResourceId } from '../support/selectors';
import { Screen } from './Screen';

const ADD_TO_CART = 'Tap to add product to cart';

/** A single product: name, price, quantity stepper and "Add to cart". */
class ProductDetailScreen extends Screen {
  // The product image sits right under the name, so it is on screen on any
  // display size. Catalog tiles describe their images differently, which keeps
  // this anchor from matching while the catalog is still in front.
  protected get anchor() {
    return $(byAccessibilityId('Displays selected product'));
  }

  get name() {
    return $(byResourceId('productTV'));
  }

  private get price() {
    return $(byResourceId('priceTV'));
  }

  private get quantityLabel() {
    return $(byResourceId('noTV'));
  }

  async priceInCents(): Promise<number> {
    return toCents(await this.price.getText());
  }

  async quantity(): Promise<number> {
    const label = await this.reveal({ id: 'noTV' });
    return Number(await label.getText());
  }

  /** Steps the quantity one tap at a time and checks that each tap registered. */
  async setQuantity(target: number): Promise<void> {
    if (!Number.isInteger(target) || target < 0) {
      throw new Error(`Quantity must be a whole number of 0 or more, got ${target}`);
    }
    let current = await this.quantity();
    while (current !== target) {
      const step = current < target ? 1 : -1;
      const button = await this.reveal({
        accessibilityId: step > 0 ? 'Increase item quantity' : 'Decrease item quantity',
      });
      await button.click();
      current += step;
      await this.waitForQuantity(current);
    }
  }

  /** The button can sit below the fold on short screens. */
  async addToCartButton(): Promise<WebdriverIO.Element> {
    return this.reveal({ accessibilityId: ADD_TO_CART });
  }

  async addToCart(): Promise<void> {
    await (await this.addToCartButton()).click();
  }

  private async waitForQuantity(expected: number): Promise<void> {
    await browser.waitUntil(async () => Number(await this.quantityLabel.getText()) === expected, {
      timeoutMsg: `Quantity did not change to ${expected}`,
    });
  }
}

export const productDetail = new ProductDetailScreen();
