/** launcher 首頁：列出 games/ 裡的遊戲，用練習玩家開遊戲頁，顯示和重設餘額。 */
interface DevGame {
  gameId: string;
  title: string;
  seats: number;
  pve: boolean;
  tableOptions: Record<string, string[]>;
}

const NAMES = ['alice', 'bob', 'carol', 'dave'];
const ROOMS: [string, string][] = [
  ['beginner', '新手'],
  ['intermediate', '中級'],
  ['advanced', '高級'],
  ['god', '神級'],
];

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return (await res.json()) as T;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, text = '', className = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function select(label: string, choices: [string, string][]): { wrap: HTMLLabelElement; input: HTMLSelectElement } {
  const wrap = el('label', label);
  const input = el('select');
  for (const [value, text] of choices) input.append(new Option(text, value));
  wrap.append(input);
  return { wrap, input };
}

function gameCard(game: DevGame): HTMLElement {
  const card = el('article', '', 'game');
  card.append(el('h2', game.title));
  const kind = game.seats > 1 ? `多人（${game.seats} 座${game.pve ? '＋莊家' : ''}）` : '單人對莊家';
  card.append(el('p', `${game.gameId} · ${kind}`, 'meta'));

  const room = select('房間', ROOMS);
  const options = Object.entries(game.tableOptions).map(([key, values]) => ({
    key,
    ...select(key, values.map((v) => [v, v] as [string, string])),
  }));
  const form = el('div', '', 'form');
  form.append(room.wrap, ...options.map((o) => o.wrap));
  card.append(form);

  const buttons = el('div', '', 'buttons');
  for (const name of NAMES) {
    const button = el('button', `以 ${name} 開啟`);
    button.addEventListener('click', () => {
      const params = new URLSearchParams({ name, room: room.input.value });
      for (const o of options) params.set(o.key, o.input.value);
      window.open(`/play/${game.gameId}/?${params}`, '_blank');
    });
    buttons.append(button);
  }
  card.append(buttons);
  return card;
}

async function showPlayers(): Promise<void> {
  const { players } = await get<{ players: { name: string; carrots: number }[] }>('/v1/dev/players');
  const list = document.getElementById('players')!;
  list.replaceChildren();
  const known = new Map(players.map((p) => [p.name, p.carrots]));
  for (const name of new Set([...NAMES, ...known.keys()])) {
    const item = el('li');
    const carrots = known.get(name);
    item.append(el('span', name, 'name'), el('span', carrots === undefined ? '尚未進場' : `${carrots.toLocaleString()} 🥕`, 'carrots'));
    const reset = el('button', '重設');
    reset.addEventListener('click', async () => {
      await fetch(`/v1/dev/players/${name}/reset`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
      await showPlayers();
    });
    item.append(reset);
    list.append(item);
  }
}

async function main(): Promise<void> {
  const box = document.getElementById('games')!;
  try {
    const { games } = await get<{ games: DevGame[] }>('/v1/dev/games');
    box.replaceChildren(...games.map(gameCard));
    if (!games.length) box.append(el('p', 'games/ 裡還沒有遊戲。'));
  } catch {
    box.replaceChildren(el('p', '連不到練習伺服器。請確認 npm run dev 還在執行。', 'error'));
  }
  await showPlayers().catch(() => undefined);
  // Balances change as hands are paid in other tabs.
  setInterval(() => void showPlayers().catch(() => undefined), 3000);
}

void main();
