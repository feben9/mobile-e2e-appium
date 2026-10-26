import { expect } from '@wdio/globals';
import { shippingAddress } from '../src/data/checkout';
import { products } from '../src/data/products';
import { users } from '../src/data/users';
import { paymentForm } from '../src/screens/PaymentScreen';
import { shippingForm, type RequiredShippingField } from '../src/screens/ShippingAddressScreen';
import { startFresh } from '../src/workflows/app';
import { enterShippingAddress, proceedToCheckoutAs } from '../src/workflows/checkout';
import { addToCart, openCart } from '../src/workflows/shopping';

// Messages exactly as the app ships them. The country one is cut short in the
// app itself ("Please provide your"); it is asserted as shipped.
const SHIPPING_ERRORS: Record<RequiredShippingField, string> = {
  fullName: 'Please provide your full name.',
  addressLine1: 'Please provide your address.',
  city: 'Please provide your city.',
  zipCode: 'Please provide your zip',
  country: 'Please provide your',
};

describe('Checkout form validation', () => {
  beforeEach(async () => {
    await startFresh();
    await addToCart(products.backpack);
    await openCart();
    await proceedToCheckoutAs(users.standard);
  });

  it('flags every required shipping field when the form is sent empty', async () => {
    await shippingForm.submit();

    for (const [field, message] of Object.entries(SHIPPING_ERRORS)) {
      await expect(shippingForm.errorFor(field as RequiredShippingField)).toHaveText(message);
    }
    await shippingForm.waitForIsShown();
  });

  it('flags only the missing field and keeps the shopper on the form', async () => {
    await shippingForm.fillIn({ ...shippingAddress, zipCode: '' });
    await shippingForm.submit();

    await expect(shippingForm.errorFor('zipCode')).toHaveText(SHIPPING_ERRORS.zipCode);
    await expect(shippingForm.errorFor('fullName')).not.toBeDisplayed();
    await expect(shippingForm.errorFor('country')).not.toBeDisplayed();
    await shippingForm.waitForIsShown();
  });

  it('flags the card fields when the payment form is sent empty', async () => {
    await enterShippingAddress(shippingAddress);
    await paymentForm.submit();

    await expect(paymentForm.errorFor('holderName')).toHaveText('Value looks invalid.');
    await expect(paymentForm.errorFor('expiry')).toHaveText('Value looks invalid.');
    await expect(paymentForm.errorFor('securityCode')).toHaveText('Value looks invalid.');
    // The card number gets an error icon but no message; see tests/known-defects.
    await expect(paymentForm.cardNumberErrorIcon).toBeDisplayed();
    await paymentForm.waitForIsShown();
  });
});
