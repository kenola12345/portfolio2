/**
 * アーケードゲームのランキング（Firebase の Firestore に保存）。
 * 設定（PUBLIC_FIREBASE_*）がないときは無効になり、ゲームだけが遊べる。
 * Firebase は重いので、ランキングを使うときまで読み込まない。
 */
export interface Entry {
  name: string;
  score: number;
  /** クリアまでの時間（ミリ秒） */
  timeMs: number;
}

const env = import.meta.env;
const config = {
  apiKey: env.PUBLIC_FIREBASE_API_KEY,
  projectId: env.PUBLIC_FIREBASE_PROJECT_ID,
  appId: env.PUBLIC_FIREBASE_APP_ID,
};

const COLLECTION = 'leaderboard';
const MOCK_KEY = 'arcade-leaderboard-mock';
/** 開発中だけ、?lbmock を付けると Firebase の代わりにブラウザ内の保存で試せる */
const useMock = () => import.meta.env.DEV && new URLSearchParams(location.search).has('lbmock');

export const NAME_MAX = 12;
export const leaderboardEnabled = () => useMock() || Boolean(config.apiKey && config.projectId && config.appId);

/** 前後の空白を除き、空白の連続を 1 つにし、制御文字を消して、12 文字までにする */
export function cleanName(raw: string): string {
  return Array.from(raw.replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim())
    .slice(0, NAME_MAX)
    .join('');
}

/** 点数が高い順、同点なら早くクリアした順 */
const byRank = (a: Entry, b: Entry) => b.score - a.score || a.timeMs - b.timeMs;

let dbPromise: Promise<{
  db: import('firebase/firestore/lite').Firestore;
  fs: typeof import('firebase/firestore/lite');
}> | null = null;

function getDb() {
  dbPromise ??= (async () => {
    const [{ initializeApp, getApps }, fs] = await Promise.all([import('firebase/app'), import('firebase/firestore/lite')]);
    const app = getApps()[0] ?? initializeApp(config);
    return { db: fs.getFirestore(app), fs };
  })();
  return dbPromise;
}

function readMock(): Entry[] {
  try {
    return JSON.parse(localStorage.getItem(MOCK_KEY) ?? '[]') as Entry[];
  } catch {
    return [];
  }
}

export async function submitScore(entry: Entry): Promise<void> {
  const name = cleanName(entry.name);
  if (!name) throw new Error('name');
  if (useMock()) {
    localStorage.setItem(MOCK_KEY, JSON.stringify([...readMock(), { ...entry, name }]));
    return;
  }
  const { db, fs } = await getDb();
  await fs.addDoc(fs.collection(db, COLLECTION), {
    name,
    score: entry.score,
    timeMs: entry.timeMs,
    createdAt: fs.serverTimestamp(),
  });
}

/** 上位 10 件。同点の並びをそろえるため、点数の上位 50 件を取ってから、時間で並べ直す */
export async function topEntries(count = 10): Promise<Entry[]> {
  if (useMock()) return readMock().sort(byRank).slice(0, count);
  const { db, fs } = await getDb();
  const snap = await fs.getDocs(fs.query(fs.collection(db, COLLECTION), fs.orderBy('score', 'desc'), fs.limit(50)));
  return snap.docs
    .map((d) => d.data())
    .filter((d) => typeof d.name === 'string' && typeof d.score === 'number' && typeof d.timeMs === 'number')
    .map((d) => ({ name: String(d.name), score: Number(d.score), timeMs: Number(d.timeMs) }))
    .sort(byRank)
    .slice(0, count);
}
