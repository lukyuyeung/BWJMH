/**
 * The one back button Bunny Gala uses: top left on every home-page screen and every game lobby,
 * the same gold-framed square, clear of the notch. Each screen lines it up with its own top row
 * (`top`, `left`, `size`) so it sits beside that screen's UI instead of on it.
 *
 *   const back = backButton(() => leaveToHall(), { top: 14, left: 18, size: 40 });
 *   back.hidden = true; // while something else owns the corner
 */

const STYLE_ID = 'bunny-gala-back-style';

const CSS = `
.bg-back {
  position: fixed;
  top: max(var(--bg-back-top, 10px), env(safe-area-inset-top));
  left: max(var(--bg-back-left, 12px), env(safe-area-inset-left));
  z-index: 2147483000;
  box-sizing: border-box;
  width: var(--bg-back-size, 44px);
  height: var(--bg-back-size, 44px);
  padding: 0;
  display: grid;
  place-items: center;
  border: 2px solid #e8b74a;
  border-radius: calc(var(--bg-back-size, 44px) * 0.27);
  background: linear-gradient(180deg, #4b1d70, #26103e);
  box-shadow: 0 0 0 2px rgba(20, 6, 32, 0.55), inset 0 1px 0 rgba(255, 228, 150, 0.55), 0 4px 10px rgba(0, 0, 0, 0.45);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.bg-back.is-inside { position: absolute; z-index: 5; }
.bg-back[hidden] { display: none; }
.bg-back:active { transform: scale(0.94); }
.bg-back:focus-visible { outline: 2px solid #fff3c4; outline-offset: 2px; }
.bg-back svg { width: 55%; height: 55%; display: block; }
`;

const ARROW =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5 7.5 12l7 7" fill="none" stroke="#ffd978" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function ensureStyle(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.append(style);
}

export interface BackButtonPlace {
  label?: string;
  /** Pixels, or any CSS length. Defaults 10px / 12px / 44px. */
  top?: number | string;
  left?: number | string;
  size?: number | string;
  /** Put the button inside this element (positioned absolutely, so `top`/`left` can be % or cq units
   *  and it scales with a scaled board) instead of fixed to the screen. */
  inside?: HTMLElement | null;
}

const css = (v: number | string) => (typeof v === 'number' ? `${v}px` : v);

/** Adds the back button to the page (once per page) and returns it. */
export function backButton(onBack: () => void, place: BackButtonPlace | string = {}): HTMLButtonElement {
  const { label = 'Back', top, left, size, inside } = typeof place === 'string' ? { label: place } : place;
  ensureStyle();
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'bg-back';
  button.setAttribute('aria-label', label);
  button.innerHTML = ARROW;
  if (top !== undefined) button.style.setProperty('--bg-back-top', css(top));
  if (left !== undefined) button.style.setProperty('--bg-back-left', css(left));
  if (size !== undefined) button.style.setProperty('--bg-back-size', css(size));
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    onBack();
  });
  if (inside) button.classList.add('is-inside');
  (inside ?? document.body).append(button);
  return button;
}
