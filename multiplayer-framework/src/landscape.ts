/**
 * Bunny Gala is landscape only: the home page and every game.
 *
 * Where the platform lets a page lock its orientation, this does: Telegram (Bot API 8.0
 * lockOrientation, which keeps the orientation the phone is in, so it is called once the phone is
 * sideways) and browsers that allow screen.orientation.lock (Android, mostly in fullscreen or an
 * installed app). iPhone browsers allow no lock at all, so on any phone held upright the page is
 * covered with a "turn your phone sideways" screen until it is turned. The Expo app locks itself
 * natively (its app config), so this screen never shows there.
 */

type TelegramLock = { lockOrientation?: () => void; isVersionAtLeast?: (v: string) => boolean };

const STYLE = `
#bg-turn {
  position: fixed; inset: 0; z-index: 2147483647; display: none;
  align-items: center; justify-content: center; flex-direction: column; gap: 18px;
  background: radial-gradient(120% 80% at 50% 30%, #3a1858 0%, #160a22 70%);
  color: #ffe7a4; font: 700 18px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif;
  text-align: center; padding: 24px; touch-action: none;
}
#bg-turn small { color: #d8c4e8; font-weight: 500; font-size: 14px; }
#bg-turn svg { width: 84px; height: 84px; animation: bg-turn 2.2s ease-in-out infinite; }
@keyframes bg-turn { 0%, 25% { transform: rotate(0deg); } 55%, 100% { transform: rotate(-90deg); } }
@media (orientation: portrait) and (pointer: coarse) {
  #bg-turn { display: flex; }
}
`;

const PHONE = `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="14" y="4" width="20" height="40" rx="4" fill="none" stroke="#f0c36a" stroke-width="3"/><circle cx="24" cy="38" r="2" fill="#f0c36a"/></svg>`;

let started = false;

function tryLock(): void {
  const telegram = (window as { Telegram?: { WebApp?: TelegramLock } }).Telegram?.WebApp;
  if (telegram?.lockOrientation && telegram.isVersionAtLeast?.('8.0') && matchMedia('(orientation: landscape)').matches) {
    telegram.lockOrientation();
  }
  const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
  void orientation?.lock?.('landscape').catch(() => undefined);
}

/** Call once per page, as early as possible. */
export function landscapeOnly(): void {
  if (started || typeof document === 'undefined') return;
  started = true;
  const style = document.createElement('style');
  style.textContent = STYLE;
  document.head.append(style);
  const cover = document.createElement('div');
  cover.id = 'bg-turn';
  cover.setAttribute('role', 'alert');
  cover.innerHTML = `${PHONE}<div>Turn your phone sideways<br>請將手機轉成橫向</div><small>Bunny Gala is played in landscape.</small>`;
  const mount = () => document.body.append(cover);
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount, { once: true });
  tryLock();
  matchMedia('(orientation: landscape)').addEventListener('change', tryLock);
  // Some browsers only allow the lock after a tap.
  window.addEventListener('pointerdown', tryLock, { once: true, capture: true });
}
