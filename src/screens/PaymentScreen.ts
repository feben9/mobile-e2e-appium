import { $ } from '@wdio/globals';
import type { PaymentCard } from '../data/checkout';
import { byAccessibilityId, byResourceId } from '../support/selectors';
import { Screen } from './Screen';

const FIELD_IDS: Record<keyof PaymentCard, string> = {
  holderName: 'nameET',
  number: 'cardNumberET',
  expiry: 'expirationDateET',
  securityCode: 'securityCodeET',
};

const ERROR_IDS: Record<keyof PaymentCard, string> = {
  holderName: 'nameErrorTV',
  number: 'cardNumberErrorTV',
  expiry: 'expirationDateErrorTV',
  securityCode: 'securityCodeErrorTV',
};

/**
 * Checkout step 2: card details. "My billing address is the same as my
 * shipping address" is ticked by default and left that way.
 */
class PaymentScreen extends Screen {
  // "Review Order" sits in a fixed bar at the bottom of the screen.
  protected get anchor() {
    return $(byAccessibilityId('Saves payment info and launches screen to review checkout data'));
  }

  get cardNumberErrorIcon() {
    return $(byResourceId('cardNumberErrorIV'));
  }

  async fillIn(card: Partial<PaymentCard>): Promise<void> {
    for (const field of Object.keys(FIELD_IDS) as (keyof PaymentCard)[]) {
      const value = card[field];
      if (value !== undefined) {
        await this.fill(FIELD_IDS[field], value);
      }
    }
  }

  async submit(): Promise<void> {
    await this.hideKeyboard();
    await this.anchor.click();
  }

  /** "Value looks invalid." under a field, hidden until the form is submitted without it. */
  errorFor(field: keyof PaymentCard) {
    return $(byResourceId(ERROR_IDS[field]));
  }
}

export const paymentForm = new PaymentScreen();
