# Mobile E2E tests with Appium and WebdriverIO

[![android](https://github.com/feben9/mobile-e2e-appium/actions/workflows/android.yml/badge.svg)](https://github.com/feben9/mobile-e2e-appium/actions/workflows/android.yml)

End-to-end tests for a native Android shopping app, run on an Android emulator
in GitHub Actions on every push.

The app under test is Sauce Labs' public
[My Demo App for Android](https://github.com/saucelabs/my-demo-app-android)
(release 2.3.0). The repository shows how I structure mobile UI automation:
screen objects, multi-screen workflows, one file that owns the locators,
explicit waits only, and tests picked by risk.

**Stack:** WebdriverIO 9, Appium 2 with the UiAutomator2 driver, TypeScript
(strict), Mocha, Allure results, GitHub Actions with an API 34 emulator.

## Architecture

```
tests/*.spec.ts            What to check: scenarios and assertions, chosen by risk
      │
      ▼
src/workflows/             Journeys across screens: log in, add to cart, check out
      │
      ▼
src/screens/               One object per screen; each acts only on its own surface
      │
      ▼
src/support/selectors.ts   The only place that builds platform-specific locators
      │
      ▼
WebdriverIO ──► Appium 2 (UiAutomator2) ──► Android emulator or device

Alongside:
src/data/                  Test accounts, products with known prices, checkout data
src/support/money.ts       Prices parsed into integer cents
src/support/app.ts         Cold restart of the app between tests
src/config/                App ids and environment settings
```

Design choices, and why:

- **Locators live in one file.** Screens describe elements by resource id,
  accessibility id or visible text. `selectors.ts` turns that into UiAutomator,
  XPath or accessibility-id strings. Supporting iOS means adding the iOS
  branches there and giving screens accessibility ids where they differ, not
  editing every screen.
- **Screens and workflows stay separate.** A screen object never navigates
  to another screen. Anything that crosses screens is a workflow, so a change
  to the checkout flow is fixed in one function.
- **Explicit waits only.** Every step waits for an element or a condition
  (`waitForDisplayed`, `waitUntil`, WebdriverIO's retrying `expect`). There are
  no fixed sleeps and no `waitForIdle`. ESLint blocks `browser.pause`, and a
  missing `await` on a WebdriverIO call is a lint error.
- **Clean state per test.** The app keeps the cart, the session and the sort
  order in memory, so each test cold-starts the app (terminate and relaunch).
  That takes a few seconds instead of a reinstall.
- **Money is compared in cents.** Prices are read from the screen as text and
  parsed into integers. The parser is strict: an unformatted floating-point
  value such as `$ 45.970000000000006` fails the test instead of being rounded.
- **Evidence on failure.** Each failed test saves a screenshot and the UI tree
  as XML. CI also keeps the Appium log and the device log.
- **The app is pinned.** `scripts/fetch-app.sh` downloads one release and
  checks its SHA-256. The APK is never committed.

## What the tests cover

23 tests in 8 spec files, plus 3 known-defect tests that run separately.

| Spec | Covers | Why it matters |
| --- | --- | --- |
| `smoke.spec.ts` | The app launches into the catalog with an empty cart; products have names and well-formed, positive prices. | If this fails, nothing else is worth running. |
| `login.spec.ts` | The standard user signs in. A missing username, a missing password and the locked-out user are refused with the right message and stay signed out. | Login guards checkout. A locked account getting in is a security defect. |
| `logout.spec.ts` | Logout asks for confirmation; Cancel keeps the session; the user can sign straight back in. | Session bugs show up as the wrong person being signed in on a shared device. |
| `product-detail.spec.ts` | The product page shows the same name and price as its catalog tile; the quantity stepper adds the chosen amount; "Add to cart" is disabled at zero. | The price a shopper sees before buying must match the catalog. |
| `cart.spec.ts` | Empty state; each line shows its unit price and quantity; the total equals the sum of the lines; the total updates when a quantity changes. | This is where a pricing bug costs money. Totals are checked in cents against the screen and against known prices. |
| `sort.spec.ts` | Price low to high, name Z to A, and back to A to Z. Checks the whole visible order, not only the first item. | A wrong order hides products from shoppers. |
| `checkout.spec.ts` | A signed-out shopper goes from cart to login, shipping, payment, review and confirmation. The review total equals the cart total plus the $5.99 delivery fee, and the cart is empty afterwards. | The revenue path, kept as one journey on purpose. |
| `checkout-validation.spec.ts` | An empty shipping form flags all five required fields; one missing field flags only that field; an empty payment form flags the card fields. | Forms that let bad data through break fulfilment; forms that flag the wrong field block real customers. |
| `known-defects/` | Three open defects (below), each written as the behaviour a user should get. | Expected to fail until the app is fixed. |

Not covered yet: the app's demo screens for WebView, QR code scanning,
geolocation, drawing and biometrics. They are not on the purchase path.
Geolocation and biometrics would come next, since Appium can set the location
and simulate a fingerprint on an emulator.

## Known defects in the app

My Demo App ships with deliberate bugs for demos. I read its source at the
2.3.0 tag before writing tests, so the suite works around them where it must
and keeps them reproducible instead of skipping them.

| Defect | Cause in the app source | How the suite handles it |
| --- | --- | --- |
| Opening the 2nd catalog tile, or any tile after the 6th, crashes the app. | `ProductCatalogFragment` reads a six-entry array whose second entry is `null`. | Known-defect test. Other specs open products that sit in a safe slot. |
| After Back from a product page, the cart badge shows the old count. | `MainActivity` refreshes the badge only when it is created, not when it resumes. | Known-defect test. Workflows return to the catalog through the menu. |
| A missing card number shows an error icon but no message. | `CheckoutFragment` reveals the field's label instead of its error text. | Known-defect test. The validation spec checks the icon. |
| Adding "Sauce Labs Bolt T-Shirt" always adds 10. | Hard-coded in `ProductDetailFragment.addToCart`. | Not automated: in every sort order its tile either crashes the app or depends on how the database orders equal prices. |
| Removing a cart item freezes the UI for 5 seconds. | A busy loop on the UI thread, there to demo performance monitoring. | Avoided; quantities are changed with the stepper. |

Run the known defects on their own with `npm run test:known-defects`, or from
the Actions tab with the "known defects" option.

## Running locally

You need Node.js 22, a JDK (17 or newer) with `JAVA_HOME` set, and the Android
SDK with `ANDROID_HOME` set, including platform-tools, the emulator and one AVD
(for example API 34, Google APIs).

```bash
npm ci
npm run fetch-app                      # downloads and checks the APK into apps/

npm install -g appium@2.19.0
appium driver install uiautomator2@4.2.9

emulator -avd <your_avd_name> &        # or connect a device with USB debugging on
appium --port 4723                     # in a second terminal

npm test                               # the whole suite
npm run test:smoke                     # smoke checks only
npx wdio run wdio.conf.ts --spec tests/cart.spec.ts   # one spec file
npm run test:known-defects             # the open app defects (expected to fail)
```

Settings come from environment variables:

| Variable | Default | Use |
| --- | --- | --- |
| `APP_PATH` | `apps/mda-2.3.0-27.apk` | APK to install. |
| `ANDROID_UDID` | not set | Pin one device or emulator when several are attached. |
| `APPIUM_HOST` / `APPIUM_PORT` | `127.0.0.1` / `4723` | Where Appium is listening. |
| `ANDROID_SYSTEM_PORT` | not set | UiAutomator2 port; give each device its own when running devices side by side. |
| `KNOWN_DEFECTS` | not set | `1` runs only the known-defect specs. |

Output goes to `reports/` (screenshots and UI trees of failed tests, WebdriverIO
logs) and `allure-results/` (open it with the Allure CLI: `allure serve allure-results`).

Before pushing: `npm run lint` and `npm run typecheck`.

## CI

`.github/workflows/android.yml` runs two jobs:

1. **Lint and typecheck** on every push and pull request.
2. **E2E**: an Ubuntu runner with KVM starts an Android API 34 emulator
   (Google APIs, x86_64, Pixel 6 profile) through
   `reactivecircus/android-emulator-runner`, with the emulator snapshot cached
   between runs. It installs Appium 2 and the UiAutomator2 driver at pinned
   versions, downloads the app, and runs the suite. Screenshots, UI trees, the
   Appium log, logcat and Allure results are uploaded as an artifact, pass or
   fail.

## Project layout

```
.github/workflows/android.yml   CI: lint + typecheck, then E2E on an emulator
scripts/fetch-app.sh            Downloads the pinned APK and checks its SHA-256
scripts/ci-run-e2e.sh           Starts Appium in CI, runs the tests, keeps the logs
src/config/                     App package and activity, environment settings
src/data/                       Users, products, checkout data
src/screens/                    Screen objects (catalog, product, cart, login, checkout steps, menu, dialogs)
src/support/                    Selectors, money parsing, app restart
src/workflows/                  Multi-screen journeys
tests/                          Specs; tests/known-defects runs separately
wdio.conf.ts                    Capabilities, timeouts, reporters, failure evidence
```

## About me

I'm Feben Tibebe, a QA lead with more than four years in software testing. At
work I built and maintain a real-device mobile automation suite with Appium and
WebdriverIO in TypeScript, and I use AI-assisted tools in day-to-day testing.
This repository applies the same approach to a public app.

LinkedIn: [linkedin.com/in/febentibebe](https://www.linkedin.com/in/febentibebe/)
