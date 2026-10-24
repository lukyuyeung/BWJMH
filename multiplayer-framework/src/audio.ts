/**
 * Sound settings shared by every Bunny Gala game page, and one background-music player.
 *
 * The Music and Sound effects switches are stored once for the whole site (all games are served
 * from the same origin under /play/), so turning music off in one game turns it off in all of
 * them. Music pauses while the page is hidden. It starts at once when the browser allows it (a
 * table page opened from its lobby after a tap), otherwise on the first tap here.
 */

const KEYS = { music: 'bunny-gala.music', sfx: 'bunny-gala.sfx' } as const;
type Kind = keyof typeof KEYS;

function read(kind: Kind): boolean {
  try {
    return localStorage.getItem(KEYS[kind]) !== 'off';
  } catch {
    return true;
  }
}

const prefs: Record<Kind, boolean> = { music: read('music'), sfx: read('sfx') };
const listeners = new Set<() => void>();

export function musicOn(): boolean {
  return prefs.music;
}

export function sfxOn(): boolean {
  return prefs.sfx;
}

export function setAudio(kind: Kind, on: boolean): void {
  if (prefs[kind] === on) return;
  prefs[kind] = on;
  try {
    localStorage.setItem(KEYS[kind], on ? 'on' : 'off');
  } catch {
    // Storage blocked: the choice holds for this page.
  }
  syncMusic();
  for (const fn of listeners) fn();
}

/** Called when either switch changes (here or, through storage, in another tab). */
export function onAudioChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

let player: HTMLAudioElement | null = null;
let wanted: { url: string; volume: number } | null = null;
/** The browser has let this page play sound (a play() succeeded, or the player tapped here). */
let unlocked = false;

function syncMusic(): void {
  const play = Boolean(wanted && prefs.music && document.visibilityState === 'visible');
  if (!play) {
    player?.pause();
    return;
  }
  if (!player) {
    player = new Audio();
    player.loop = true;
  }
  const src = new URL(wanted!.url, location.href).href;
  if (player.src !== src) player.src = src;
  player.volume = wanted!.volume;
  // Blocked until the first tap: the tap listener below tries again.
  void player.play().then(() => (unlocked = true), () => undefined);
}

/** Loops this track as the page's music (replacing any other). `null` stops the music. */
export function playMusic(url: string | null, volume = 0.35): void {
  wanted = url ? { url, volume } : null;
  syncMusic();
}

/** A one-off cue over the music (a win fanfare), when sound effects are on. */
export function playCue(url: string, volume = 0.6): void {
  if (!prefs.sfx || !unlocked) return;
  const cue = new Audio(url);
  cue.volume = volume;
  void cue.play().catch(() => undefined);
}

if (typeof window !== 'undefined') {
  const wake = () => {
    unlocked = true;
    syncMusic();
    window.removeEventListener('pointerdown', wake, true);
    window.removeEventListener('keydown', wake, true);
  };
  window.addEventListener('pointerdown', wake, true);
  window.addEventListener('keydown', wake, true);
  document.addEventListener('visibilitychange', syncMusic);
  window.addEventListener('storage', (event) => {
    const kind = (Object.keys(KEYS) as Kind[]).find((k) => KEYS[k] === event.key);
    if (!kind) return;
    prefs[kind] = event.newValue !== 'off';
    syncMusic();
    for (const fn of listeners) fn();
  });
}

/**
 * Draws the Music and Sound effects switches into `el` (a game's settings panel) and keeps them
 * in step with the settings. Each row is `.audio-row` with a label and On / Off buttons; the
 * chosen one has `.on`. The game's own CSS styles them.
 */
export function mountAudioSwitches(el: HTMLElement, labels = { music: 'Music', sfx: 'Sound effects', on: 'On', off: 'Off' }): void {
  const isOn = (kind: Kind) => prefs[kind];
  const paint = () => {
    el.innerHTML = (['music', 'sfx'] as const)
      .map((kind) => {
        const btn = (on: boolean) =>
          `<button type="button" data-kind="${kind}" data-on="${on ? 1 : 0}" class="${isOn(kind) === on ? 'on' : ''}" aria-pressed="${isOn(kind) === on}">${on ? labels.on : labels.off}</button>`;
        return `<div class="audio-row"><span>${labels[kind]}</span>${btn(true)}${btn(false)}</div>`;
      })
      .join('');
  };
  el.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLElement>('[data-kind]');
    if (button) setAudio(button.dataset.kind as Kind, button.dataset.on === '1');
  });
  onAudioChange(paint);
  paint();
}
