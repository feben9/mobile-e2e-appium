/**
 * The app under test: Sauce Labs "My Demo App" for Android (native), 2.3.0.
 *
 * The package and activity names come from the app's source at the 2.3.0 tag
 * (app/build.gradle, app/src/main/AndroidManifest.xml) and were checked
 * against the manifest inside the released APK.
 */
export const APP = {
  version: '2.3.0',
  apkFileName: 'mda-2.3.0-27.apk',
  packageId: 'com.saucelabs.mydemoapp.android',
  launchActivity: 'com.saucelabs.mydemoapp.android.view.activities.SplashActivity',
  // The splash screen hands over to MainActivity, which hosts every other screen.
  readyActivities: 'com.saucelabs.mydemoapp.android.view.activities.*',
} as const;
