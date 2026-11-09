import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from '../App';
import { __resetDBForTests, getAllGames } from '../services/db';
import { loadAppData, saveSettings } from '../services/repository';
import { DEFAULT_SETTINGS } from '../data/defaultSettings';

async function renderLoaded() {
  const utils = render(<App />);
  await screen.findByRole('button', { name: /TOQUE PARA/ });
  return utils;
}

async function startGame() {
  fireEvent.click(screen.getByRole('button', { name: /TOQUE PARA/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'COMEÇAR DESAFIO' }));
  await screen.findByText('Pergunta 1 de 10');
}

beforeEach(async () => {
  await __resetDBForTests();
  window.location.hash = '';
});
afterEach(() => vi.useRealTimers());

describe('aplicação completa', () => {
  it('joga uma partida inteira, registra estatísticas e mostra os cursos', async () => {
    await renderLoaded();
    expect(screen.getByText('DESAFIO TECH')).toBeInTheDocument();
    expect(screen.getByText(/10 perguntas • Aproximadamente 3 minutos/)).toBeInTheDocument();
    await startGame();

    for (let i = 1; i <= 10; i++) {
      await screen.findByText(`Pergunta ${i} de 10`);
      const list = screen.getByRole('list', { name: 'Alternativas' });
      const options = within(list).getAllByRole('button');
      expect(options).toHaveLength(4);
      fireEvent.click(options[0]);
      // Todas as alternativas ficam bloqueadas após responder.
      within(list).getAllByRole('button').forEach((b) => expect(b).toBeDisabled());
      expect(await screen.findByText(/Resposta correta!|Resposta incorreta/)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: i === 10 ? 'VER RESULTADO' : 'PRÓXIMA PERGUNTA' }));
    }

    expect(await screen.findByText('DESAFIO CONCLUÍDO!')).toBeInTheDocument();
    expect(screen.getByText('PONTOS')).toBeInTheDocument();
    expect(screen.getByText('respostas corretas')).toBeInTheDocument();

    await waitFor(async () => {
      const games = await getAllGames();
      expect(games).toHaveLength(1);
      expect(games[0].completed).toBe(true);
      expect(games[0].answers).toHaveLength(10);
    });

    fireEvent.click(screen.getByRole('button', { name: /CONHEÇA NOSSOS CURSOS/ }));
    expect(await screen.findByText('Ciência de Dados')).toBeInTheDocument();
    expect(screen.getByText('Análise e Desenvolvimento de Sistemas')).toBeInTheDocument();
    expect(screen.getByText('SEU FUTURO COMEÇA AQUI!')).toBeInTheDocument();
    // Todos os cursos de graduação, com os 4 de computação primeiro.
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(titles).toHaveLength(10);
    expect(titles.slice(0, 4)).toEqual([
      'Ciência de Dados',
      'Inteligência Artificial',
      'Engenharia de Software',
      'Análise e Desenvolvimento de Sistemas',
    ]);
    expect(titles).toContain('Direito');
    const more = screen.getByRole('heading', { name: 'Mais cursos de graduação' });
    expect(more.compareDocumentPosition(screen.getByText('Administração')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // Sem URL cadastrada, nenhum QR Code é exibido (nada de URL fictícia).
    expect(screen.queryByRole('img', { name: /QR Code/ })).not.toBeInTheDocument();
  });

  it('encerra a pergunta quando o tempo acaba e permite avançar', async () => {
    await renderLoaded();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await startGame();
    await act(async () => {
      vi.advanceTimersByTime(20_500);
    });
    expect(await screen.findByText('Tempo esgotado!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Resposta correta\)/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'PRÓXIMA PERGUNTA' }));
    expect(await screen.findByText('Pergunta 2 de 10')).toBeInTheDocument();
  });

  it('sem temporizador, a pergunta não expira', async () => {
    await saveSettings({ ...DEFAULT_SETTINGS, timePerQuestion: 0 });
    await renderLoaded();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await startGame();
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(40_000);
    });
    expect(screen.queryByText('Tempo esgotado!')).not.toBeInTheDocument();
  });

  it('volta sozinho à tela inicial após inatividade e limpa a partida', async () => {
    await renderLoaded();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await startGame();
    await act(async () => {
      vi.advanceTimersByTime(61_000);
    });
    expect(await screen.findByRole('button', { name: /TOQUE PARA/ })).toBeInTheDocument();
    await startGame(); // nova partida começa do zero
    expect(screen.getByLabelText('Pontuação: 0')).toBeInTheDocument();
  });

  it('a tela de cursos retorna ao início após 30 s', async () => {
    await renderLoaded();
    await startGame();
    for (let i = 1; i <= 10; i++) {
      await screen.findByText(`Pergunta ${i} de 10`);
      fireEvent.click(within(screen.getByRole('list', { name: 'Alternativas' })).getAllByRole('button')[1]);
      fireEvent.click(await screen.findByRole('button', { name: i === 10 ? 'VER RESULTADO' : 'PRÓXIMA PERGUNTA' }));
    }
    const coursesBtn = await screen.findByRole('button', { name: /CONHEÇA NOSSOS CURSOS/ });
    vi.useFakeTimers({ shouldAdvanceTime: true });
    fireEvent.click(coursesBtn);
    await screen.findByText('SEU FUTURO COMEÇA AQUI!');
    await act(async () => {
      vi.advanceTimersByTime(29_000);
    });
    expect(screen.getByText('SEU FUTURO COMEÇA AQUI!')).toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(2_000);
    });
    expect(await screen.findByRole('button', { name: /TOQUE PARA/ })).toBeInTheDocument();
  });
});

describe('logotipo com link', () => {
  it('abre a página de cursos de graduação em outra aba', async () => {
    await renderLoaded();
    const link = screen.getByRole('link', { name: /conheça os cursos de graduação/ });
    expect(link).toHaveAttribute('href', 'https://faculdadedonaduzzi.com.br/cursos-de-graduacao/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('sem link configurado, o logotipo não é clicável', async () => {
    await saveSettings({ ...DEFAULT_SETTINGS, logoLinkUrl: '' });
    await renderLoaded();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: DEFAULT_SETTINGS.institutionName })).toBeInTheDocument();
  });
});

describe('painel administrativo', () => {
  async function openAdmin() {
    await renderLoaded();
    act(() => {
      window.location.hash = '#/admin';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    await screen.findByText('Área administrativa');
  }

  it('exige PIN e rejeita PIN incorreto', async () => {
    await openAdmin();
    fireEvent.change(screen.getByLabelText('PIN'), { target: { value: '0000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText('PIN incorreto.')).toBeInTheDocument();
    expect(screen.queryByText(/Painel administrativo/)).not.toBeInTheDocument();
  });

  it('abre com acesso secreto (5 toques no canto) e gerencia perguntas', async () => {
    await renderLoaded();
    const stage = document.querySelector('main.stage') as HTMLElement;
    for (let i = 0; i < 5; i++) fireEvent.pointerDown(stage, { clientX: 10, clientY: 10 });
    await screen.findByText('Área administrativa');
    fireEvent.change(screen.getByLabelText('PIN'), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText(/Painel administrativo/)).toBeInTheDocument();
    expect(screen.getByText('Banco de perguntas (60 ativas de 60)')).toBeInTheDocument();

    // Desativa uma pergunta e confere a persistência.
    const checkbox = screen.getAllByRole('checkbox', { name: 'Ativa' })[0];
    fireEvent.click(checkbox);
    expect(await screen.findByText('Banco de perguntas (59 ativas de 60)')).toBeInTheDocument();
    await waitFor(async () => expect((await loadAppData()).questions.filter((q) => q.active)).toHaveLength(59));

    // Criação com validação.
    fireEvent.click(screen.getByRole('button', { name: /Nova pergunta/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar pergunta' }));
    expect(await screen.findByText('O enunciado é obrigatório.')).toBeInTheDocument();
  });

  it('salva configurações (tempo e URL do QR Code)', async () => {
    await openAdmin();
    fireEvent.change(screen.getByLabelText('PIN'), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    fireEvent.click(await screen.findByRole('button', { name: /Configurações/ }));
    fireEvent.change(screen.getByLabelText(/URL do QR Code/), { target: { value: 'nao-e-url' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar configurações' }));
    expect(await screen.findByText(/deve começar com http/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/URL do QR Code/), { target: { value: 'https://exemplo.edu.br/cursos' } });
    fireEvent.change(screen.getByLabelText('Segundos por pergunta'), { target: { value: '30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar configurações' }));
    expect(await screen.findByText('Configurações salvas e aplicadas.')).toBeInTheDocument();
    const { settings } = await loadAppData();
    expect(settings.qrUrl).toBe('https://exemplo.edu.br/cursos');
    expect(settings.timePerQuestion).toBe(30);
  });
});
