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

#### 2. Open in Xcode

Open `swift/HouseHub.xcodeproj` in Xcode (double-click it in Finder, or run `open swift/HouseHub.xcodeproj` from the repo root). The project is pre-configured — no manual setup required.

#### 3. Build and run

Select a simulator or device in Xcode and press **⌘R**. The app will load the full HouseHub interface from the bundle.

To see a live preview in the Xcode Canvas, open `ContentView.swift` and click **Resume** in the Canvas panel (or press **⌥⌘↩**). The preview renders the app using the built `WebApp` bundle.

### Rebuilding after web changes

Whenever you update the web app, re-run:

```bash
npm run build:ios
```

Then rebuild in Xcode (**⌘R**). Xcode picks up the updated `WebApp` folder automatically.
