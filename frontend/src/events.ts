// Internal in-app navigation event, dispatched after history.pushState() so
// listeners (title/canonical sync, occasion restore) can react to a URL change
// without faking `popstate` — which every third-party listener on the page
// (analytics, extensions…) would also observe. Real Back/Forward navigation
// still arrives as a genuine `popstate`.
export const NAVIGATE_EVENT = 'gp:navigate';
