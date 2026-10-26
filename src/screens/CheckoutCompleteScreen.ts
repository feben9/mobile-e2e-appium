import { $ } from '@wdio/globals';
import { byResourceId } from '../support/selectors';
import { Screen } from './Screen';

/** Order confirmation. "Continue Shopping" empties the cart and returns to the catalog. */
class CheckoutCompleteScreen extends Screen {
  protected get anchor() {
    return $(byResourceId('completeTV'));
  }

  get heading() {
    return this.anchor;
  }

  async continueShopping(): Promise<void> {
    await (await this.reveal({ accessibilityId: 'Tap to open catalog' })).click();
  }
}

export const checkoutComplete = new CheckoutCompleteScreen();
