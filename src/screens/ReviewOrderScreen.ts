import { $ } from '@wdio/globals';
import { toCents } from '../support/money';
import { byAccessibilityId, byResourceId } from '../support/selectors';
import { Screen } from './Screen';

/** Checkout step 3: order summary with delivery address, delivery fee and total. */
class ReviewOrderScreen extends Screen {
  // "Place Order" sits in a fixed bar at the bottom of the screen.
  protected get anchor() {
    return $(byAccessibilityId('Completes the process of checkout'));
  }

  get recipientName() {
    return $(byResourceId('fullNameTV'));
  }

  private get itemCountLabel() {
    return $(byResourceId('itemNumberTV'));
  }

  private get totalLabel() {
    return $(byResourceId('totalAmountTV'));
  }

  async deliveryFeeInCents(): Promise<number> {
    const fee = await this.reveal({ id: 'amountTV' });
    return toCents(await fee.getText());
  }

  async totalInCents(): Promise<number> {
    return toCents(await this.totalLabel.getText());
  }

  /** The bottom bar reads "3 Items". */
  async itemCount(): Promise<number> {
    const label = await this.itemCountLabel.getText();
    const match = /^(\d+) Items?$/.exec(label.trim());
    if (!match) {
      throw new Error(`Unexpected item count label "${label}"`);
    }
    return Number(match[1]);
  }

  async placeOrder(): Promise<void> {
    await this.anchor.click();
  }
}

export const reviewOrder = new ReviewOrderScreen();
