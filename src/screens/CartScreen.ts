import { $, $$, browser } from '@wdio/globals';
import { toCents, type PricedLine } from '../support/money';
import { byAccessibilityId, byResourceId, byText, rowOf } from '../support/selectors';
import { Screen } from './Screen';

export interface CartLine extends PricedLine {
  name: string;
}

/** "My Cart": one row per product, a running total and "Proceed To Checkout". */
class CartScreen extends Screen {
  // The checkout button sits in a fixed bar at the bottom, so it is always on
  // screen while the cart has items.
  protected get anchor() {
    return $(byAccessibilityId('Confirms products for checkout'));
  }

  get emptyCartTitle() {
    return $(byText('No Items'));
  }

  get goShoppingButton() {
    return $(byResourceId('shoppingBt'));
  }

  private get itemCountLabel() {
    return $(byResourceId('itemsTV'));
  }

  private get totalLabel() {
    return $(byResourceId('totalPriceTV'));
  }

  private row(productName: string) {
    return $(rowOf({ id: 'titleTV', text: productName }, 'productRV'));
  }

  /**
   * Brings the whole row on screen. A row whose lower half is below the fold
   * has no quantity in the UI tree yet, so reading it would fail.
   */
  private async revealRow(productName: string) {
    await this.reveal({ text: productName });
    for (let attempt = 0; attempt < 3; attempt++) {
      if (await this.row(productName).$(byResourceId('noTV')).isDisplayed()) {
        return this.row(productName);
      }
      await this.scrollDown();
    }
    throw new Error(`The cart row for "${productName}" never came fully on screen`);
  }

  /** One row as shown: name, unit price and quantity. */
  async line(productName: string): Promise<CartLine> {
    const row = await this.revealRow(productName);
    return {
      name: productName,
      unitPriceCents: toCents(await row.$(byResourceId('priceTV')).getText()),
      quantity: Number(await row.$(byResourceId('noTV')).getText()),
    };
  }

  async lines(): Promise<CartLine[]> {
    const names = await $$(byResourceId('titleTV')).map((title) => title.getText());
    const lines: CartLine[] = [];
    for (const name of names) {
      lines.push(await this.line(name));
    }
    return lines;
  }

  async increaseQuantity(productName: string): Promise<void> {
    const row = await this.revealRow(productName);
    await row.$(byAccessibilityId('Increase item quantity')).click();
  }

  async totalInCents(): Promise<number> {
    return toCents(await this.totalLabel.getText());
  }

  /** The bar reads "3 Items". */
  async itemCount(): Promise<number> {
    const label = await this.itemCountLabel.getText();
    const match = /^(\d+) Items?$/.exec(label.trim());
    if (!match) {
      throw new Error(`Unexpected item count label "${label}"`);
    }
    return Number(match[1]);
  }

  async waitForItemCount(expected: number): Promise<void> {
    await browser.waitUntil(async () => (await this.itemCount()) === expected, {
      timeoutMsg: `Cart did not show ${expected} items`,
    });
  }

  async proceedToCheckout(): Promise<void> {
    await this.anchor.click();
  }
}

export const cart = new CartScreen();
