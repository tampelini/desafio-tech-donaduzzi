// Verifica se o build está pronto para funcionar offline: Service Worker
// gerado, manifesto PWA presente e todos os arquivos essenciais pré-cacheados.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const fail = (msg) => { console.error('✗', msg); process.exitCode = 1; };
const ok = (msg) => console.log('✓', msg);

if (!existsSync(join(dist, 'sw.js'))) fail('dist/sw.js não encontrado (rode npm run build).');
else {
  const sw = readFileSync(join(dist, 'sw.js'), 'utf8');
  const manifest = JSON.parse(readFileSync(join(dist, 'manifest.webmanifest'), 'utf8'));
  ok(`Manifesto: ${manifest.name} (display=${manifest.display}, orientation=${manifest.orientation})`);
  const assets = readdirSync(join(dist, 'assets'));
  const mustCache = ['index.html', ...assets.filter((f) => /\.(js|css|woff2)$/.test(f)).map((f) => `assets/${f}`)];
  const missing = mustCache.filter((f) => !sw.includes(`"${f}"`));
  if (missing.length) fail(`Arquivos fora do pré-cache: ${missing.join(', ')}`);
  else ok(`${mustCache.length} arquivos essenciais pré-cacheados (HTML, JS, CSS e fontes).`);
  // URLs repetidas fazem o Workbox abortar o pré-cache inteiro em tempo de execução.
  const urls = [...sw.matchAll(/\{url:"([^"]+)"/g)].map((m) => m[1]);
  const dupes = urls.filter((u, i) => urls.indexOf(u) !== i);
  if (dupes.length) fail(`Entradas duplicadas no pré-cache (o modo offline não funcionaria): ${[...new Set(dupes)].join(', ')}`);
  else ok(`${urls.length} entradas no pré-cache, sem duplicatas.`);
  if (/https?:\/\/(?!www\.w3\.org)/.test(readFileSync(join(dist, 'index.html'), 'utf8'))) fail('index.html referencia recursos externos.');
  else ok('Nenhum recurso externo no index.html.');
}
