export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
}

export interface PaymentCard {
  holderName: string;
  number: string;
  /** Digits only: the field inserts the slash itself (MM/YY). */
  expiry: string;
  securityCode: string;
}

// Deliberately different from the placeholder hints in the form, so a test can
// never pass by reading a hint back.
export const shippingAddress: ShippingAddress = {
  fullName: 'Ada Tester',
  addressLine1: '12 Harbour Street',
  addressLine2: 'Flat 3',
  city: 'Leeds',
  state: 'West Yorkshire',
  zipCode: 'LS1 4AP',
  country: 'United Kingdom',
};

// The app never charges a card; this is the standard Visa test number.
export const paymentCard: PaymentCard = {
  holderName: 'Ada Tester',
  number: '4111111111111111',
  expiry: '0330',
  securityCode: '123',
};
