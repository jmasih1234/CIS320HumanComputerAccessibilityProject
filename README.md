# HouseHub

A roommate management app for keeping track of chores, finances, schedules, and more.

## Running the web app

```bash
npm install
npm run dev
```

Or use `npm run web` to start the dev server and open it in your browser automatically.

## What's in it

- **Calendar** — Shared events for the household  
- **Chores** — Rotating tasks, custom chores (common ones rotate, one-time ones stay assigned), dishwasher/trash duties, plus room cleaning rotation  
- **Finances** — Split bills and track who's paid  
- **Availability** — See who's home, maybe, or away  
- **Reserve a room** — Book shared spaces  
- **Settings** — Add/remove roommates and rooms  

Data is stored in `localStorage` for now, so it persists between sessions but stays on the device. The data layer is abstracted so a real backend can be plugged in later.

---

## iOS App

The `swift/HouseHub` directory contains the native iOS wrapper. It bundles the compiled web app inside the iOS app and serves it offline via a `WKWebView` — no network connection required.

### How it works

1. `npm run build:ios` compiles the React/Vite app and copies the output into `swift/HouseHub/WebApp/`.
2. At runtime, a custom `WKURLSchemeHandler` (`BundleSchemeHandler`) intercepts all `app://` requests and serves files directly from the bundle.
3. Any URL that doesn't match a real file falls back to `index.html`, so React Router's client-side navigation always works correctly.

### Setup

**Requirements:** macOS with Xcode 15 or later.

#### 1. Build and bundle the web app

```bash
npm install
npm run build:ios
```

This produces a `swift/HouseHub/WebApp/` folder containing the compiled site (this folder is git-ignored since it is a build artifact).

#### 2. Create the Xcode project (first time only)

1. Open Xcode → **File → New → Project**.
2. Choose **iOS → App**, then click **Next**.
3. Fill in:
   - **Product Name:** `HouseHub`
   - **Bundle Identifier:** `com.yourteam.HouseHub` (or any reverse-domain ID you prefer)
   - **Interface:** SwiftUI
   - **Language:** Swift
4. Choose the `swift/` directory as the save location and uncheck **Create Git repository** (git is already set up).
5. Delete the files Xcode generated (`ContentView.swift`, `Item.swift`, the app entry point) and instead **drag the existing files** from `swift/HouseHub/` into the Xcode project navigator:
   - `HouseHubApp.swift`
   - `ContentView.swift`
   - `WebView.swift`
   - `Assets.xcassets`
   - `Preview Content/`
6. **Add the `WebApp` folder as a folder reference** (not a group):
   - In the project navigator, right-click the `HouseHub` target folder.
   - Choose **Add Files to "HouseHub"**.
   - Select `swift/HouseHub/WebApp`, make sure **Create folder references** is selected (blue folder icon), and check the app target.

#### 3. Build and run

Select a simulator or device in Xcode and press **⌘R**. The app will load the full HouseHub interface from the bundle.

### Rebuilding after web changes

Whenever you update the web app, re-run:

```bash
npm run build:ios
```

Then rebuild in Xcode (**⌘R**). Xcode picks up the updated `WebApp` folder automatically.
