import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

/**
 * Captura erros inesperados de renderização: mostra uma mensagem amigável e
 * recarrega a aplicação sozinha, para o totem nunca ficar travado.
 */
export class ErrorBoundary extends Component<{ children: ReactNode; autoReloadMs?: number }, State> {
  state: State = { error: null };
  private timer: number | undefined;

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro na aplicação', error, info.componentStack);
    this.timer = window.setTimeout(() => this.recover(), this.props.autoReloadMs ?? 6000);
  }

  componentWillUnmount() {
    window.clearTimeout(this.timer);
  }

  recover = () => {
    window.clearTimeout(this.timer);
    window.location.hash = '';
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="stage flex flex-col items-center justify-center gap-6 p-8 text-center" role="alert">
        <p className="font-display text-4xl font-bold">Ops! Algo deu errado.</p>
        <p className="text-xl opacity-80">O jogo será reiniciado em instantes.</p>
        <button
          type="button"
          onClick={this.recover}
          className="min-h-[4rem] rounded-2xl bg-primary px-10 font-display text-2xl font-bold text-bg"
        >
          REINICIAR AGORA
        </button>
      </div>
    );
  }
}
