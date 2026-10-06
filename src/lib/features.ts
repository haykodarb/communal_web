// Feature switches for parts of the app that exist but aren't offered yet.

/**
 * Communities are being replaced by the friends-of-friends network. The pages
 * and components stay in the code base, but every /communities URL redirects
 * home and nothing links to them (the drawer item is hidden too).
 */
export const COMMUNITIES_ENABLED = false;
