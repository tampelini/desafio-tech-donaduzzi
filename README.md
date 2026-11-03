# Desafio Tech Donaduzzi

Quiz gamificado da Faculdade Donaduzzi para totem touchscreen Android na vertical (referência 1080 × 1920).
Funciona **100% offline**, como **APK Android** ou como **PWA** no Chrome.

- React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion + Lucide
- IndexedDB (perguntas, configurações, estatísticas anônimas)
- PWA com Service Worker (Workbox) e APK via Capacitor 8
- 60 perguntas integradas; partidas de 10 com distribuição 3/2/2/1/1/1

## Scripts

| Comando | O que faz |
|---|---|
| `npm install` | instala as dependências (uma vez) |
| `npm run dev` | servidor de desenvolvimento (`http://localhost:5173`) |
| `npm run build` | verificação de tipos + build de produção em `dist/` |
| `npm run preview` | serve o build em `http://localhost:4173` (com Service Worker) |
| `npm test` | testes automatizados (Vitest) |
| `npm run verify:offline` | confere se o build pré-cacheia tudo o que o modo offline precisa |
| `npm run android:apk` | build web + sincronização + APK de depuração |
| `npm run android:open` | abre o projeto Android no Android Studio |

Requisitos: Node 20 ou mais recente. Para o APK: Android SDK (Android Studio) e **JDK 21**.

## Gerar o APK (instalação local)

O APK já gerado está em `android/app/build/outputs/apk/debug/app-debug.apk`.

Para gerar de novo após qualquer alteração:

```bash
# Windows (Git Bash). Aponte JAVA_HOME para um JDK 21.
export JAVA_HOME="$HOME/.jdks/jbr-21.0.11"
npm run android:apk
```

> O Gradle 8.14 usado pelo Capacitor não roda com o JDK 25 embutido no Android Studio mais recente. Use um JDK 21
> (em Android Studio: *Settings → Build Tools → Gradle → Gradle JDK*).

`android/local.properties` aponta para o SDK desta máquina (`sdk.dir=...`). Em outro computador, ajuste ou apague o
arquivo e abra o projeto no Android Studio.

**APK de depuração x APK de versão:** o `app-debug.apk` é assinado com a chave de depuração e serve para instalar
manualmente nos totens. Para distribuir pela Play Store ou por MDM, gere uma versão assinada em
*Android Studio → Build → Generate Signed App Bundle / APK* e guarde a chave em local seguro: atualizações
precisam da mesma chave.

### Instalar no totem

1. No Android, habilite *Configurações → Segurança → Instalar apps desconhecidos* para o gerenciador de arquivos.
2. Copie o `app-debug.apk` (cabo USB, pendrive ou e-mail) e toque nele para instalar. Ou, com depuração USB:
   `adb install -r app-debug.apk`.
3. Abra **Desafio Tech**. O app abre em tela cheia, na vertical, com a tela sempre ligada e o botão "voltar" desativado.

O que o APK faz de diferente da versão web:
- tela cheia imersiva (barras do sistema ocultas; reaparecem só com gesto de deslizar);
- orientação travada em retrato e tela que não apaga;
- botão "voltar" do Android ignorado;
- exportações (CSV/JSON) abrem a folha de compartilhamento do Android (salvar no Drive, enviar por e-mail etc.);
- os dados ficam no armazenamento do app; desinstalar o app **apaga as estatísticas** (exporte antes).
- atualizar = instalar um APK mais novo por cima (mantém os dados). Antes, aumente `versionCode` em
  `android/app/build.gradle`.

## Modo quiosque (importante)

Nenhum app ou página web consegue, sozinho, impedir que o visitante saia dele. Para bloquear o totem:

- **Fixação de tela (qualquer Android):** *Configurações → Segurança → Fixar app*. Abra o Desafio Tech, toque no ícone
  do app na tela de recentes e escolha *Fixar*. Para sair é preciso o gesto/PIN do aparelho.
- **Quiosque gerenciado (recomendado em eventos):** um MDM (Android Enterprise, Google Workspace, Scalefusion, Hexnode
  etc.) em modo *dedicated device / single-app kiosk* com o pacote `br.edu.donaduzzi.desafiotech`.
- Desative notificações, suspensão automática e atualizações automáticas do sistema durante eventos.

## Versão web / PWA (alternativa ao APK)

O jogo está hospedado gratuitamente no **GitHub Pages**: <https://tampelini.github.io/desafio-tech-donaduzzi/>
(painel: `…/#/admin`). Cada `git push` na branch `main` roda os testes, gera o build e publica a nova versão
automaticamente (`.github/workflows/deploy.yml`). Para usar um domínio próprio da faculdade, configure em
*Settings → Pages → Custom domain* do repositório.

Os dados (perguntas editadas, configurações, estatísticas) ficam **em cada aparelho**, não no servidor: o site só
entrega os arquivos do jogo.

Para hospedar em outro lugar:

1. `npm run build` e publique a pasta `dist/` em qualquer servidor **HTTPS** (o Service Worker exige HTTPS ou
   `localhost`).
2. No Chrome do Android, abra o endereço e use *Menu → Instalar app / Adicionar à tela inicial*.
3. Abra uma vez com internet: depois disso funciona offline. Novas versões são baixadas em segundo plano e só são
   aplicadas quando o jogo está na tela inicial, nunca no meio de uma partida.

Sugestões para o Chrome: desligue a tradução automática e mantenha o app instalado (abre sem barra de endereço).

## Painel administrativo

- Acesso: toque **5 vezes em 3 segundos no canto superior esquerdo** do jogo (área invisível) ou acesse `…/#/admin`.
- **PIN padrão: `1234`. Troque-o na aba *Segurança* antes do primeiro evento.**
- A sessão fecha após 5 min sem uso; 5 PINs errados bloqueiam o acesso por 1 minuto.
- O PIN é uma barreira contra visitantes, não segurança forte: quem tiver o aparelho desbloqueado e ferramentas de
  desenvolvedor pode apagar os dados locais.

Abas:
- **Perguntas:** filtrar por categoria/status, buscar, criar, editar, ativar/desativar, excluir, importar/exportar
  JSON (mesclar ou substituir) e restaurar as 60 originais. Tudo é validado antes de salvar.
- **Cursos:** habilitar, editar, reordenar, adicionar e remover cursos da tela final.
- **Configurações:** nomes e textos, logotipo, cores, perguntas por partida e por categoria, pontos, tempo por pergunta
  (ou desativado), inatividade, som, tela cheia, URL do QR Code e mensagens de resultado.
- **Estatísticas:** partidas iniciadas/concluídas, média de pontos, tempo médio, histograma, acertos/erros/tempo
  esgotado e respostas por pergunta, histórico com data e hora. Exportação em CSV (`;`, UTF-8, abre no Excel).
  Nenhum dado pessoal é coletado.

## Identidade visual

Segue o site <https://faculdadedonaduzzi.com.br/>: telas brancas com títulos vinho e rótulos em carmim, alternadas com
telas de destaque (início e resultado) em vinho, como as faixas do site, com detalhes em creme e dourado. Os botões
são em formato de pílula e os cartões, cinza-claro.

| Token | Cor | Uso |
|---|---|---|
| `brand` | `#541822` vinho | faixas, telas de destaque, títulos |
| `primary` | `#A31938` carmim | botões, rótulos, números |
| `accent` | `#CC3366` rosa | degradê dos botões |
| `cream` / `gold` | `#F7EBB5` / `#E9B949` | destaques nas telas vinho, pontuação |
| `surface` | `#F1F1F1` | cartões |

Fontes: **Sora** nos títulos (a mesma do site, licença livre, embutida) e **Inter** no texto. O site usa também a
fonte *Sarun*, que não foi embutida por não ter licença confirmada; se a faculdade tiver o arquivo e a licença,
basta adicioná-la em `src/styles` e em `tailwind.config.js`.

O logotipo oficial está em `public/assets/logo-donaduzzi.png` (copiado do site institucional). Nas telas vinho ele
aparece numa cápsula branca; se houver uma versão do logotipo para fundo escuro, cadastre-a no painel.

## Personalização

- **Logotipo:** já vem o oficial. Para trocar: *Configurações → Identidade* (colorido para telas brancas e, opcional,
  versão para fundo vinho).
- **Cores:** *Configurações → Cores*, com os códigos do manual da marca. Os padrões ficam em
  `src/data/defaultSettings.ts`.
- **QR Code:** cadastre a URL **oficial** dos cursos em *Configurações → Tela de cursos e QR Code*. Sem URL, o QR Code
  não aparece. O código é gerado no aparelho, sem serviço externo.
- **Cursos:** pela aba *Cursos* ou, como padrão de fábrica, em `src/data/courses.ts`. Não informe duração,
  modalidade, vagas ou autorização sem dados institucionais confirmados.
- **Perguntas padrão:** `src/data/questions.ts`. Formato de importação JSON (lista):

```json
[{ "id": "fac-11", "category": "faculdade", "prompt": "Enunciado?",
   "options": [{"id":"a","text":"…"},{"id":"b","text":"…"},{"id":"c","text":"…"},{"id":"d","text":"…"}],
   "correctOptionId": "b", "explanation": "Explicação curta.", "active": true }]
```

Categorias: `faculdade`, `ia`, `dados`, `engsoft`, `ads`, `inovacao`.

- **Ícones do app:** substitua `public/assets/icon-192.png` / `icon-512.png` (PWA) e os ícones em
  `android/app/src/main/res/mipmap-*` (APK; use *Android Studio → New → Image Asset*). Os atuais são genéricos.
- **Nome/ID do APK:** `capacitor.config.ts` (`appName`, `appId`).

## Regras do jogo implementadas

- 10 perguntas sorteadas por partida: 3 Faculdade, 2 IA, 2 Ciência de Dados, 1 Eng. Software, 1 ADS, 1 Inovação.
- Sem repetição na partida; perguntas e alternativas embaralhadas. A resposta correta é guardada pelo ID da
  alternativa (não pela posição) e nunca fica na mesma posição 3 vezes seguidas.
- Perguntas das últimas 3 partidas são evitadas enquanto houver alternativas (configurável).
- Acerto = 100 pontos; erro ou tempo esgotado = 0; máximo 1000. Sem bônus de velocidade. O tempo total da partida é
  registrado.
- 20 s por pergunta (configurável ou desativável). Sem toque por 60 s durante a partida ou 30 s na tela de cursos,
  o jogo volta à tela inicial e limpa a partida.
- Toques repetidos são ignorados (o fluxo é um reducer que descarta ações fora de contexto, e os botões têm trava
  contra toque duplo). Erros inesperados mostram um aviso e reiniciam o app sozinhos.

## Estrutura

```
src/
  data/        perguntas, cursos, categorias e configurações padrão
  game/        sorteio, embaralhamento e pontuação (puros, testados)
  store/       reducer do jogo e contexto de dados/tema
  services/    IndexedDB, repositório, estatísticas/CSV, PIN, som, PWA, arquivos
  hooks/       inatividade e contagem regressiva
  components/  botões, temporizador, QR Code, fundo animado, confete…
  screens/     Início, Instruções, Pergunta, Resultado, Cursos
  admin/       painel administrativo
  test/        testes automatizados
android/       projeto nativo (Capacitor)
scripts/       geração de ícones e verificação offline
```

## Acessibilidade e desempenho

- Interface em `rem` escalada pela largura útil de um palco 9:16: 1080 × 1920 e telas menores, sem rolagem.
- Botões com no mínimo 48 px (a maioria acima de 70 px), texto em alto contraste, acerto/erro indicados também por
  ícone e texto (não só por cor), rótulos para leitores de tela.
- Respeita "reduzir movimento" do sistema. Em aparelhos muito lentos, abra a versão web com `?noanim` para desligar
  as animações.
- Animações só com `transform`/`opacity`; fundo de circuitos em CSS puro.

## Testes

`npm test` roda 43 testes: banco de perguntas (60, IDs únicos, gabarito), sorteio (10 perguntas, distribuição,
sem duplicatas, embaralhamento preservando a correta, posições variadas, inativas excluídas, anti-repetição),
pontuação e faixas de mensagem, tempo esgotado, conclusão, reinício por inatividade (partida e tela de cursos),
persistência no IndexedDB, estatísticas/CSV, PIN e fluxos completos do jogo e do painel administrativo.
`npm run verify:offline` confere o pré-cache do Service Worker.
