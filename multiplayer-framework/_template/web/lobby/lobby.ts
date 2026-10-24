/**
 * Bunny Gala 遊戲大廳（標準版面，照德州撲克 Poker Room 的大廳做）。版面規格見 docs/大廳規格.md。
 *
 * 版面：左下主視覺角色、上方「返回鍵＋玩家名牌 / Logo / 設定」、右邊是卡片（先選玩法，再選房間）、
 * 左下角圖示列（規則、音效）、右下角霓虹 QUICK START。
 *
 * 這個資料夾（web/lobby/）每款遊戲都一樣，不要改；要換的只有 mountLobby() 的設定和 public/assets/lobby/ 裡的圖。
 */
import './lobby.css';
import type { RoomId, RoomLimit } from '@bunny-gala/contract';
import { callApi, playConnection } from '@bunny-gala/contract/client';
import { leaveToHall } from '@bunny-gala/contract/shell';
import { backButton } from '@bunny-gala/contract/back';
import { landscapeOnly } from '@bunny-gala/contract/landscape';
import { mountAudioSwitches, musicOn, onAudioChange, setAudio, sfxOn } from '@bunny-gala/contract/audio';

export interface LobbyCard {
  id: string;
  /** 卡片上方的標題。 */
  title: string;
  /** 卡片的場景圖（360×400）。 */
  art: string;
}

export interface LobbyChoice {
  room: RoomId;
  /** 第一步選的玩法 id；沒有第一步時是 undefined。 */
  mode?: string;
}

export interface LobbyConfig {
  /** 等於 GameLogic.gameId。 */
  gameId: string;
  /** 中間上方的 Logo（900×240，透明背景）。 */
  logo: string;
  /** 左下的主視覺角色（900×1050，透明背景）。 */
  mascot: string;
  /** 背景場景（2400×1029）。 */
  scene: string;
  /**
   * 第一步「怎麼玩」的卡片（Poker 是 VS Bunnies / Online），2 張最好看。
   * 不需要時不填，大廳直接從選房間開始。常見用法：tableOptions 的選擇（例如牌組），或單人桌 / 多人桌。
   */
  modes?: LobbyCard[];
  /** 第一步的標題。預設「怎麼玩？」 */
  modesHeading?: string;
  /** 四個房間的卡片，順序固定新手 → 神級。 */
  rooms: Record<RoomId, { title: string; art: string }>;
  /** 第二步的標題。預設「選擇房間」 */
  roomsHeading?: string;
  /** QUICK START 用的玩法。預設是第一個玩法。 */
  quickMode?: string;
  /** 選好之後：通常是打開 play.html?room=…（記得帶上 ?name=）。 */
  open(choice: LobbyChoice): void;
}

const ROOM_ORDER: RoomId[] = ['beginner', 'intermediate', 'advanced', 'god'];

/** QUICK START 去哪一間：上次玩的那間（還進得去的話），否則最便宜、進得去的那間。 */
export function quickRoom(rooms: RoomLimit[], last: RoomId | null): RoomId | null {
  if (last && rooms.find((r) => r.id === last)?.allowed) return last;
  return ROOM_ORDER.find((id) => rooms.find((r) => r.id === id)?.allowed) ?? null;
}

/** 上鎖房間的斜帶文字，和 Poker 一樣用 K 表示千。 */
export function needLabel(entry: number): string {
  return `需要 ${entry >= 1000 ? `${Math.round(entry / 1000).toLocaleString('en-US')}K` : entry}`;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function icon(name: string): HTMLImageElement {
  const img = el('img', 'gl-icon-img');
  img.src = `assets/lobby/icons/icon-${name}.png`;
  img.alt = '';
  img.draggable = false;
  return img;
}

/** 金框方形圖示按鈕（文字只給讀屏軟體）。 */
function iconButton(name: string, label: string, small = false): HTMLButtonElement {
  const button = el('button', `gl-icon${small ? ' small' : ''}`);
  button.type = 'button';
  button.setAttribute('aria-label', label);
  const face = el('span', 'gl-icon-face');
  face.append(icon(name));
  button.append(face);
  return button;
}

/** 卡片：金粉色外框、場景圖滿版、標題在上方。 */
function card(title: string, art: string, extra: HTMLElement[] = [], className = ''): HTMLButtonElement {
  const button = el('button', `gl-tile ${className}`);
  button.type = 'button';
  const inner = el('span', 'gl-tile-inner');
  inner.style.backgroundImage = `url("${art}")`;
  inner.append(el('span', 'gl-tile-title', title), el('span', 'gl-tile-spacer'), ...extra);
  button.append(inner);
  return button;
}

/** 一個浮在大廳上的面板（設定、規則）。 */
function sheet(root: HTMLElement, title: string, body: HTMLElement): void {
  const shade = el('div', 'gl-sheet-shade');
  const box = el('div', 'gl-sheet');
  const close = iconButton('back', '關閉', true);
  close.classList.add('gl-sheet-close');
  close.onclick = () => shade.remove();
  shade.onclick = (event) => {
    if (event.target === shade) shade.remove();
  };
  box.append(close, el('h2', 'gl-sheet-title', title), body);
  shade.append(box);
  root.append(shade);
}

/** 畫出大廳。進得去的房間、餘額、玩家名字都從平台讀。 */
export async function mountLobby(config: LobbyConfig): Promise<void> {
  landscapeOnly();
  const KEY = `${config.gameId}-last-room`;
  const root = el('div', 'gl-lobby');
  root.style.setProperty('--gl-scene', `url("${config.scene}")`);
  document.body.append(root);

  const [me, catalog] = await Promise.all([
    callApi<{ displayName: string; carrots: number }>(playConnection, '/v1/me'),
    callApi<{ games: { gameId: string; rooms: RoomLimit[] }[] }>(playConnection, '/v1/casino/games'),
  ]).catch((err: unknown) => {
    root.append(el('p', 'gl-error', err instanceof Error ? err.message : String(err)));
    throw err;
  });
  const rooms = catalog.games.find((g) => g.gameId === config.gameId)?.rooms ?? [];

  // 上方：返回鍵＋玩家名牌（左）、Logo（中）、設定（右）。
  const top = el('div', 'gl-top');
  const plate = el('div', 'gl-player');
  const initial = el('span', 'gl-player-avatar', [...me.displayName][0]?.toUpperCase() ?? '?');
  const who = el('span', 'gl-player-text');
  who.append(el('span', 'gl-player-name', me.displayName), el('span', 'gl-player-carrots', `🥕 ${me.carrots.toLocaleString('en-US')}`));
  plate.append(initial, who);
  const logo = el('img', 'gl-logo');
  logo.src = config.logo;
  logo.alt = '';
  logo.draggable = false;
  const tools = el('div', 'gl-tools');
  const settings = iconButton('settings', '設定', true);
  settings.onclick = () => {
    const body = el('div', 'gl-audio');
    mountAudioSwitches(body, { music: '音樂', sfx: '音效', on: '開', off: '關' });
    sheet(root, '設定', body);
  };
  tools.append(settings);
  top.append(plate, logo, tools);

  const mascot = el('img', 'gl-mascot');
  mascot.src = config.mascot;
  mascot.alt = '';
  mascot.draggable = false;

  const panel = el('div', 'gl-panel');
  const heading = el('h1', 'gl-heading');
  const tiles = el('div', 'gl-tiles');
  panel.append(heading, tiles);

  // 左下圖示列：規則、音效（一次開關音樂和音效）。
  const bottom = el('div', 'gl-bottom');
  const rules = iconButton('ranks', '規則');
  rules.onclick = async () => {
    const text = await callApi<{ title: string; body: string }>(playConnection, `/v1/casino/games/${config.gameId}/rules`);
    sheet(root, text.title, el('p', 'gl-rules', text.body));
  };
  const allOn = () => musicOn() || sfxOn();
  const sound = iconButton(allOn() ? 'sound-on' : 'sound-off', '音效');
  sound.onclick = () => {
    const on = !allOn();
    setAudio('music', on);
    setAudio('sfx', on);
  };
  onAudioChange(() => sound.querySelector('.gl-icon-face')!.replaceChildren(icon(allOn() ? 'sound-on' : 'sound-off')));
  bottom.append(rules, sound);

  const quick = el('button', 'gl-quick', 'QUICK START');
  quick.type = 'button';

  root.append(mascot, top, panel, bottom, quick);

  let last: RoomId | null = null;
  try {
    const saved = localStorage.getItem(KEY);
    if (ROOM_ORDER.includes(saved as RoomId)) last = saved as RoomId;
  } catch {
    // 瀏覽器不讓存：從最便宜的房間開始。
  }
  let mode = config.modes?.[0]?.id;
  let screen: 'modes' | 'rooms' = 'rooms';
  const go = (room: RoomId) => {
    try {
      localStorage.setItem(KEY, room);
    } catch {
      // 這次記不住，沒關係。
    }
    config.open({ room, mode });
  };

  const showModes = () => {
    screen = 'modes';
    heading.textContent = config.modesHeading ?? '怎麼玩？';
    tiles.className = 'gl-tiles modes';
    tiles.replaceChildren(
      ...(config.modes ?? []).map((m) => {
        const button = card(m.title, m.art);
        button.onclick = () => {
          mode = m.id;
          showRooms();
        };
        return button;
      }),
    );
  };

  const showRooms = () => {
    screen = 'rooms';
    heading.textContent = config.roomsHeading ?? '選擇房間';
    tiles.className = 'gl-tiles rooms';
    tiles.replaceChildren(
      ...ROOM_ORDER.map((id) => {
        const limit = rooms.find((r) => r.id === id);
        const look = config.rooms[id];
        if (!limit?.allowed) {
          const locked = card(look.title, look.art, [el('span', 'gl-tile-badge', needLabel(limit?.entry ?? 0))], 'locked');
          locked.disabled = true;
          return locked;
        }
        const button = card(look.title, look.art, [el('span', 'gl-tile-note', `底注 ${limit.minBet.toLocaleString('en-US')}`)], id === last ? 'last' : '');
        button.onclick = () => go(id);
        return button;
      }),
    );
  };

  // 返回鍵：選房間 → 回到選玩法；選玩法（或沒有第一步）→ 回 Bunny Gala 首頁。
  backButton(() => (screen === 'rooms' && config.modes?.length ? showModes() : leaveToHall()), { inside: top });

  const quickTo = quickRoom(rooms, last);
  if (quickTo) {
    quick.onclick = () => {
      mode = config.quickMode ?? config.modes?.[0]?.id;
      go(quickTo);
    };
  } else quick.disabled = true;

  if (config.modes?.length) showModes();
  else showRooms();
}
