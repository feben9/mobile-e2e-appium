import type { PaymentCard, ShippingAddress } from '../data/checkout';
import type { User } from '../data/users';
import { cart } from '../screens/CartScreen';
import { login } from '../screens/LoginScreen';
import { paymentForm } from '../screens/PaymentScreen';
import { reviewOrder } from '../screens/ReviewOrderScreen';
import { shippingForm } from '../screens/ShippingAddressScreen';

/**
 * From the cart to the shipping form for a signed-out shopper (every test
 * starts signed out): "Proceed To Checkout" asks them to log in first, then
 * continues to the shipping form.
 */
export async function proceedToCheckoutAs(user: User): Promise<void> {
  await cart.proceedToCheckout();
  await login.waitForIsShown();
  await login.logIn(user);
  await shippingForm.waitForIsShown();
}

export async function enterShippingAddress(address: ShippingAddress): Promise<void> {
  await shippingForm.fillIn(address);
  await shippingForm.submit();
  await paymentForm.waitForIsShown();
}

export async function enterPayment(card: PaymentCard): Promise<void> {
  await paymentForm.fillIn(card);
  await paymentForm.submit();
  await reviewOrder.waitForIsShown();
}
