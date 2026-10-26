import { expect } from '@wdio/globals';
import { paymentCard, shippingAddress } from '../src/data/checkout';
import { DELIVERY_FEE_CENTS, products } from '../src/data/products';
import { users } from '../src/data/users';
import { cart } from '../src/screens/CartScreen';
import { catalog } from '../src/screens/CatalogScreen';
import { checkoutComplete } from '../src/screens/CheckoutCompleteScreen';
import { header } from '../src/screens/HeaderBar';
import { reviewOrder } from '../src/screens/ReviewOrderScreen';
import { formatCents } from '../src/support/money';
import { startFresh } from '../src/workflows/app';
import { enterPayment, enterShippingAddress, proceedToCheckoutAs } from '../src/workflows/checkout';
import { addToCart, openCart } from '../src/workflows/shopping';

describe('Checkout', () => {
  beforeEach(async () => {
    await startFresh();
  });

  it('takes a signed-out shopper from cart to order confirmation', async () => {
    await addToCart(products.backpack, 2);
    await openCart();
    const cartTotal = await cart.totalInCents();
    expect(cartTotal).toBe(2 * products.backpack.priceCents);

    await proceedToCheckoutAs(users.standard);
    await enterShippingAddress(shippingAddress);
    await enterPayment(paymentCard);

    // Review: the order total is the cart total plus the flat delivery fee.
    await expect(reviewOrder.recipientName).toHaveText(shippingAddress.fullName);
    expect(await reviewOrder.itemCount()).toBe(2);
    const deliveryFee = await reviewOrder.deliveryFeeInCents();
    expect(deliveryFee).toBe(DELIVERY_FEE_CENTS);
    expect(formatCents(await reviewOrder.totalInCents())).toBe(formatCents(cartTotal + deliveryFee));

    await reviewOrder.placeOrder();
    await checkoutComplete.waitForIsShown();
    await expect(checkoutComplete.heading).toHaveText('Checkout Complete');

    // Continuing empties the cart.
    await checkoutComplete.continueShopping();
    await catalog.waitForIsShown();
    expect(await header.cartCount()).toBe(0);
  });
});
