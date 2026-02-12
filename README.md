# HouseHub

A roommate management app for keeping track of chores, finances, schedules, and more.

## Running it

```bash
npm install
npm run dev
```

Or use `npm run web` to start the dev server and open it in your browser automatically.

## What’s in it

- **Calendar** — Shared events for the household  
- **Chores** — Rotating tasks, custom chores (common ones rotate, one-time ones stay assigned), dishwasher/trash duties, plus room cleaning rotation  
- **Finances** — Split bills and track who’s paid  
- **Availability** — See who’s home, maybe, or away  
- **Reserve a room** — Book shared spaces  
- **Settings** — Add/remove roommates and rooms  

Data is stored in `localStorage` for now, so it persists between sessions but stays on the device. The data layer is abstracted so a real backend can be plugged in later.
