/**
 * How a game page fits into Bunny Gala, the same way the arcade games already do (mines-web,
 * crash-web): the home page (Beta / tg-web, or the App's WebView) opens the game at the playUrl
 * from POST /v1/plays, which carries `?play=<token>` and, from the web, `?hall=<plaza URL>`.
 *
 * A game with its own lobby (Three Card Poker) shows its table in an iframe; the two talk with
 * the `carrot-*` messages below.
 */

export type AuthHeaders = Record<string, string>;

/** Table page to the page around it (a game's own lobby, or the App's WebView). */
export type GameMessage =
  /** Loading, from 0 to 1. */
  | { type: 'carrot-progress'; ratio: number }
  /** The table art is up. */
  | { type: 'carrot-ready' }
  /** The player left the table. `to: 'rooms'`: back to the room picker, not the lobby's start. */
  | { type: 'carrot-quit'; to?: 'rooms' }
  /** The player's carrots changed at the table. */
  | { type: 'carrot-carrots'; carrots: number }
  /** The table could not open or was lost. */
  | { type: 'carrot-error'; code: string; message: string };

/** The lobby to its table page. */
export type LobbyMessage =
  /** The lobby's Exit button: leave the table, then send `carrot-quit`. */
  { type: 'carrot-exit'; to?: 'rooms' };

const HALL_KEY = 'bunny-gala-hall';
const PLAY_KEY = 'bunny-gala-play';

/**
 * The play token this page was opened with. Remembered for the tab, so a game's table page (an
 * iframe of its lobby, without the query) and a reload keep it.
 */
export function playToken(): string | null {
  const fromUrl = new URLSearchParams(location.search).get('play');
  if (fromUrl && fromUrl.length > 8) {
    try {
      sessionStorage.setItem(PLAY_KEY, fromUrl);
    } catch {
      /* Private windows may refuse; the URL still has it. */
    }
    return fromUrl;
  }
  try {
    return sessionStorage.getItem(PLAY_KEY);
  } catch {
    return null;
  }
}

/** Keeps the play token out of the address bar; it stays remembered for this tab. */
export function hidePlayToken(): void {
  playToken();
  const params = new URLSearchParams(location.search);
  if (!params.has('play')) return;
  params.delete('play');
  const rest = params.toString();
  history.replaceState(null, '', rest ? `${location.pathname}?${rest}` : location.pathname);
}

/**
 * Headers for the Bunny Gala API. Opened without a play token in development, `?name=alice` signs
 * in as a dev player of that name (the server accepts it only with AUTH_ALLOW_DEV=1).
 */
export function playHeaders(): AuthHeaders {
  const token = playToken();
  if (token) return { Authorization: `Bearer ${token}` };
  const name = new URLSearchParams(location.search).get('name')?.replace(/[^\w-]/g, '').slice(0, 24);
  if (name) return { Authorization: 'Bearer dev', 'x-dev-did': `did:privy:dev-${name}` };
  return {};
}

/** Where Leave goes on the web: the plaza, from `?hall=` (remembered for this tab, so a reload or a
 *  link that drops it still finds the way back). Only https, or http on this machine. */
export function hallReturnUrl(): string | null {
  let raw = new URLSearchParams(location.search).get('hall');
  try {
    if (raw) sessionStorage.setItem(HALL_KEY, raw);
    // Only the top page: a table inside a lobby's frame leaves through the lobby, not to the plaza.
    else if (window.parent === window) raw = sessionStorage.getItem(HALL_KEY);
  } catch {
    /* Private windows may refuse; the URL still has it. */
  }
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    return url.protocol === 'https:' || (url.protocol === 'http:' && local) ? url.toString() : null;
  } catch {
    return null;
  }
}

type NativeBridge = Window & { ReactNativeWebView?: { postMessage(message: string): void } };

/** Leaves the game for Bunny Gala: the App's WebView, the plaza link, or the page around this one. */
export function leaveToHall(): void {
  const bridge = (window as NativeBridge).ReactNativeWebView;
  if (bridge) {
    bridge.postMessage(JSON.stringify({ type: 'carrot-quit' }));
    return;
  }
  const hall = hallReturnUrl();
  if (hall) {
    location.assign(hall);
    return;
  }
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'carrot-quit' }, '*');
    return;
  }
  // Opened without `?hall=` (a shared or typed link): the game server passes everything outside
  // /play/ to the home page, so the plaza is on this same site.
  location.assign('/plaza');
}

/** Sends a message to the page around this one (a game's lobby). Does nothing at the top. */
export function tellParent(message: GameMessage): void {
  if (window.parent !== window) window.parent.postMessage(message, location.origin);
}

/** Runs `leave` when the lobby's Exit button is pressed, then tells the lobby the table is left. */
export function onLobbyExit(leave: () => void | Promise<void>): void {
  window.addEventListener('message', (event) => {
    const data = event.data as LobbyMessage | null;
    if (event.origin !== location.origin || data?.type !== 'carrot-exit') return;
    void Promise.resolve()
      .then(leave)
      .catch(() => undefined)
      .finally(() => tellParent(data.to === 'rooms' ? { type: 'carrot-quit', to: 'rooms' } : { type: 'carrot-quit' }));
  });
}

/** The room picked in the lobby, from the page's `?room=`. */
export function roomFromUrl<R extends string>(rooms: readonly R[], fallback: R): R {
  const room = new URLSearchParams(location.search).get('room');
  return rooms.includes(room as R) ? (room as R) : fallback;
}
