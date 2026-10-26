import { $, $$, browser } from '@wdio/globals';
import { toCents } from '../support/money';
import { byAccessibilityId, byResourceId, siblingOf } from '../support/selectors';
import { Screen } from './Screen';

/** The product grid shown at launch. */
class CatalogScreen extends Screen {
  protected get anchor() {
    return $(byAccessibilityId('Displays all products of catalog'));
  }

  private get titles() {
    return $$(byResourceId('titleTV'));
  }

  private get prices() {
    return $$(byResourceId('priceTV'));
  }

  /** Product names currently on screen, in grid order (left to right, top to bottom). */
  async visibleProductNames(): Promise<string[]> {
    return this.titles.map((title) => title.getText());
  }

  async visiblePricesInCents(): Promise<number[]> {
    const labels = await this.prices.map((price) => price.getText());
    return labels.map(toCents);
  }

  async priceOf(productName: string): Promise<number> {
    await this.reveal({ text: productName });
    const price = $(siblingOf({ id: 'titleTV', text: productName }, 'priceTV'));
    return toCents(await price.getText());
  }

  /** Taps the product's image, which is what opens the product page. */
  async openProduct(productName: string): Promise<void> {
    await this.reveal({ text: productName });
    await $(siblingOf({ id: 'titleTV', text: productName }, 'productIV')).click();
  }

  /** Sorting reloads the grid in the background; wait for the new order to land. */
  async waitForFirstProduct(productName: string): Promise<void> {
    await browser.waitUntil(async () => (await this.visibleProductNames())[0] === productName, {
      timeoutMsg: `"${productName}" never became the first product`,
    });
  }
}

export const catalog = new CatalogScreen();
