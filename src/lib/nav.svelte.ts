// How many pages the app has navigated since it opened (0 = the page the app
// loaded on). A pushed page uses it to tell whether "back" returns to another
// app page (show a back arrow) or would leave the app (show the drawer instead).
export const nav = $state({ depth: 0 });
