import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, 'data');
const dbPath = join(dataDir, 'store-games.sqlite');
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '127.0.0.1';

mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    data TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS carts (
    owner_id TEXT PRIMARY KEY,
    data TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS favorites (
    owner_id TEXT PRIMARY KEY,
    data TEXT NOT NULL
  );
`);

seedFromJson();

const server = createServer(async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(Boolean);

    if (pathParts[0] === 'games') {
      await handleGames(req, res, pathParts, url);
      return;
    }

    if (pathParts[0] === 'users') {
      await handleUsers(req, res, pathParts, url);
      return;
    }

    if (pathParts[0] === 'cart') {
      await handleJsonStore(req, res, pathParts, 'carts', { items: [], total: 0 });
      return;
    }

    if (pathParts[0] === 'favorites') {
      await handleJsonStore(req, res, pathParts, 'favorites', []);
      return;
    }

    sendJson(res, 404, { error: 'Ruta no encontrada' });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: 'Error interno del servidor' });
  }
});

server.listen(port, host, () => {
  console.log(`SQLite API running at http://${host}:${port}`);
  console.log(`Database: ${dbPath}`);
});

function seedFromJson() {
  const gameCount = db.prepare('SELECT COUNT(*) AS count FROM games').get().count;
  const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;

  if (gameCount > 0 || userCount > 0) {
    return;
  }

  const dbJson = JSON.parse(readFileSync(join(__dirname, 'db.json'), 'utf8'));
  const insertGame = db.prepare('INSERT INTO games (id, data) VALUES (?, ?)');
  const insertUser = db.prepare('INSERT INTO users (id, email, password, data) VALUES (?, ?, ?, ?)');

  db.exec('BEGIN');
  try {
    for (const game of dbJson.games || []) {
      insertGame.run(String(game.id), JSON.stringify(game));
    }

    for (const user of dbJson.users || []) {
      insertUser.run(String(user.id), user.email, user.password, JSON.stringify(user));
    }

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

async function handleGames(req, res, pathParts, url) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Método no permitido' });
    return;
  }

  if (pathParts[1]) {
    const row = db.prepare('SELECT data FROM games WHERE id = ?').get(pathParts[1]);
    if (!row) {
      sendJson(res, 404, { error: 'Juego no encontrado' });
      return;
    }
    sendJson(res, 200, JSON.parse(row.data));
    return;
  }

  const rows = db.prepare('SELECT data FROM games ORDER BY CAST(id AS INTEGER), id').all();
  let games = rows.map((row) => JSON.parse(row.data));
  const q = normalize(url.searchParams.get('q'));
  const nameLike = normalize(url.searchParams.get('name_like'));

  if (q) {
    games = games.filter((game) => {
      const haystack = normalize(`${game.name} ${game.category} ${game.description}`);
      return haystack.includes(q);
    });
  }

  if (nameLike) {
    games = games.filter((game) => normalize(game.name).includes(nameLike));
  }

  sendJson(res, 200, games);
}

async function handleUsers(req, res, pathParts, url) {
  if (req.method === 'GET' && pathParts[1]) {
    const row = db.prepare('SELECT data FROM users WHERE id = ?').get(pathParts[1]);
    if (!row) {
      sendJson(res, 404, { error: 'Usuario no encontrado' });
      return;
    }
    sendJson(res, 200, JSON.parse(row.data));
    return;
  }

  if (req.method === 'GET') {
    const email = url.searchParams.get('email');
    const password = url.searchParams.get('password');
    let users = db.prepare('SELECT data FROM users ORDER BY rowid').all().map((row) => JSON.parse(row.data));

    if (email !== null) {
      users = users.filter((user) => user.email === email);
    }

    if (password !== null) {
      users = users.filter((user) => user.password === password);
    }

    sendJson(res, 200, users);
    return;
  }

  if (req.method === 'POST') {
    const user = await readJson(req);
    const newUser = { ...user, id: randomUUID() };
    db.prepare('INSERT INTO users (id, email, password, data) VALUES (?, ?, ?, ?)')
      .run(newUser.id, newUser.email, newUser.password, JSON.stringify(newUser));
    sendJson(res, 201, newUser);
    return;
  }

  if (req.method === 'PUT' && pathParts[1]) {
    const user = await readJson(req);
    const updatedUser = { ...user, id: pathParts[1] };
    const result = db.prepare('UPDATE users SET email = ?, password = ?, data = ? WHERE id = ?')
      .run(updatedUser.email, updatedUser.password, JSON.stringify(updatedUser), pathParts[1]);

    if (result.changes === 0) {
      sendJson(res, 404, { error: 'Usuario no encontrado' });
      return;
    }

    sendJson(res, 200, updatedUser);
    return;
  }

  sendJson(res, 405, { error: 'Método no permitido' });
}

async function handleJsonStore(req, res, pathParts, table, emptyValue) {
  const ownerId = pathParts[1];
  if (!ownerId) {
    sendJson(res, 400, { error: 'Falta owner_id' });
    return;
  }

  if (req.method === 'GET') {
    const row = db.prepare(`SELECT data FROM ${table} WHERE owner_id = ?`).get(ownerId);
    sendJson(res, 200, row ? JSON.parse(row.data) : emptyValue);
    return;
  }

  if (req.method === 'PUT') {
    const data = await readJson(req);
    db.prepare(`
      INSERT INTO ${table} (owner_id, data)
      VALUES (?, ?)
      ON CONFLICT(owner_id) DO UPDATE SET data = excluded.data
    `).run(ownerId, JSON.stringify(data));
    sendJson(res, 200, data);
    return;
  }

  sendJson(res, 405, { error: 'Método no permitido' });
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}
