import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { GameRecord } from '../types';

interface QuizDB extends DBSchema {
  kv: { key: string; value: unknown };
  games: { key: string; value: GameRecord; indexes: { startedAt: number } };
}

const DB_NAME = 'desafio-tech-donaduzzi';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<QuizDB> | null> | null = null;

// Se o IndexedDB estiver indisponível (modo anônimo restrito, cota esgotada),
// o jogo continua funcionando com armazenamento em memória.
const memoryKV = new Map<string, unknown>();
const memoryGames = new Map<string, GameRecord>();

function getDB(): Promise<IDBPDatabase<QuizDB> | null> {
  if (!dbPromise) {
    dbPromise = (async () => {
      if (typeof indexedDB === 'undefined') return null;
      try {
        return await openDB<QuizDB>(DB_NAME, DB_VERSION, {
          upgrade(db) {
            if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
            if (!db.objectStoreNames.contains('games')) {
              const store = db.createObjectStore('games', { keyPath: 'id' });
              store.createIndex('startedAt', 'startedAt');
            }
          },
        });
      } catch (err) {
        console.warn('IndexedDB indisponível; usando memória.', err);
        return null;
      }
    })();
  }
  return dbPromise;
}

export async function getKV<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  if (!db) return memoryKV.get(key) as T | undefined;
  try {
    return (await db.get('kv', key)) as T | undefined;
  } catch {
    return memoryKV.get(key) as T | undefined;
  }
}

export async function setKV<T>(key: string, value: T): Promise<void> {
  memoryKV.set(key, value);
  const db = await getDB();
  if (!db) return;
  await db.put('kv', value as unknown, key);
}

export async function deleteKV(key: string): Promise<void> {
  memoryKV.delete(key);
  const db = await getDB();
  if (db) await db.delete('kv', key);
}

export async function putGame(record: GameRecord): Promise<void> {
  memoryGames.set(record.id, record);
  const db = await getDB();
  if (!db) return;
  try {
    await db.put('games', record);
  } catch (err) {
    console.warn('Falha ao salvar partida', err);
  }
}

export async function getAllGames(): Promise<GameRecord[]> {
  const db = await getDB();
  if (!db) return [...memoryGames.values()].sort((a, b) => a.startedAt - b.startedAt);
  return db.getAllFromIndex('games', 'startedAt');
}

export async function clearGames(): Promise<void> {
  memoryGames.clear();
  const db = await getDB();
  if (db) await db.clear('games');
}

/** Apenas para testes. */
export async function __resetDBForTests(): Promise<void> {
  const db = await getDB();
  if (db) {
    await db.clear('kv');
    await db.clear('games');
  }
  memoryKV.clear();
  memoryGames.clear();
}
