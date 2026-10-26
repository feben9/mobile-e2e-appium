import { $ } from '@wdio/globals';
import type { ShippingAddress } from '../data/checkout';
import { byResourceId, byText } from '../support/selectors';
import { Screen } from './Screen';

const FIELD_IDS: Record<keyof ShippingAddress, string> = {
  fullName: 'fullNameET',
  addressLine1: 'address1ET',
  addressLine2: 'address2ET',
  city: 'cityET',
  state: 'stateET',
  zipCode: 'zipET',
  country: 'countryET',
};

const ERROR_IDS = {
  fullName: 'fullNameErrorTV',
  addressLine1: 'address1ErrorTV',
  city: 'cityErrorTV',
  zipCode: 'zipErrorTV',
  country: 'countryErrorTV',
} as const;

export type RequiredShippingField = keyof typeof ERROR_IDS;

/** Checkout step 1: the shipping address form. */
class ShippingAddressScreen extends Screen {
  protected get anchor() {
    return $(byText('Enter a shipping address'));
  }

  /** Fills the fields that are present in `address`; missing ones are left untouched. */
  async fillIn(address: Partial<ShippingAddress>): Promise<void> {
    for (const field of Object.keys(FIELD_IDS) as (keyof ShippingAddress)[]) {
      const value = address[field];
      if (value !== undefined) {
        await this.fill(FIELD_IDS[field], value);
      }
    }
  }

  async submit(): Promise<void> {
    await this.hideKeyboard();
    await (await this.reveal({ accessibilityId: 'Saves user info for checkout' })).click();
  }

  /** The red message under a required field. Hidden until the form is submitted without it. */
  errorFor(field: RequiredShippingField) {
    return $(byResourceId(ERROR_IDS[field]));
  }
}

export const shippingForm = new ShippingAddressScreen();
