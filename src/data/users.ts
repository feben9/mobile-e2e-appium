export interface User {
  username: string;
  password: string;
}

/**
 * Accounts listed on the app's own login screen. The app accepts any
 * non-empty username and password, except the locked-out user.
 *
 * The app also offers visual@example.com, which replaces catalog prices with
 * random ones for visual-testing demos. It is left out on purpose: the money
 * checks need real prices.
 */
export const users = {
  // Spelled "bod" in the app itself.
  standard: { username: 'bod@example.com', password: '10203040' },
  lockedOut: { username: 'alice@example.com', password: '10203040' },
} satisfies Record<string, User>;
