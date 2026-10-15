# eSalba — Offline emergency reporting

Ionic/Angular Android prototype with offline device reports, GPS capture, and optional SMS composer fallback.

**Important:** Saving a report or opening the SMS composer does not mean the LGU has received it. An SMS gateway number must be verified and configured before use. This is not a replacement for official emergency channels.

## Download Android APK

Open [GitHub Actions](https://github.com/cedimscalapan/Esalba/actions/workflows/build-apk.yml) and download the `eSalba-debug-APK` artifact from a **successful** run. Extract the archive and install `app-debug.apk` on Android.

## Local development

`npm install && npm run build && npx cap add android && npx cap sync android`

GitHub Actions builds the Android debug APK on pushes to `main` or manual dispatch.