import { $, browser } from '@wdio/globals';
import { byAccessibilityId, byResourceId } from '../support/selectors';
import { Screen } from './Screen';

/** The bar at the top of every screen: menu, sort (catalog only) and cart. */
class HeaderBar extends Screen {
  protected get anchor() {
    return $(byAccessibilityId('View menu'));
  }

  private get sortButton() {
    return $(byAccessibilityId('Shows current sorting order and displays available sorting options'));
  }

  private get cartButton() {
    return $(byAccessibilityId('View cart'));
  }

  private get cartBadge() {
    return $(byResourceId('cartTV'));
  }

  async openMenu(): Promise<void> {
    await this.anchor.click();
  }

  async openSortOptions(): Promise<void> {
    await this.sortButton.click();
  }

  async openCart(): Promise<void> {
    await this.cartButton.click();
  }

  /** Item count on the cart badge. The badge is hidden while the cart is empty. */
  async cartCount(): Promise<number> {
    if (!(await this.cartBadge.isDisplayed())) {
      return 0;
    }
    return Number(await this.cartBadge.getText());
  }

  async waitForCartCount(expected: number): Promise<void> {
    await browser.waitUntil(async () => (await this.cartCount()) === expected, {
      timeoutMsg: `Cart badge did not show ${expected}`,
    });
  }
}

export const header = new HeaderBar();
