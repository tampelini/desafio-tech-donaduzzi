import type { ReactNode } from 'react';
import { useAppData } from '../store/AppDataContext';
import { openExternal } from '../services/externalLink';

export function isWebUrl(url: string): boolean {
  return /^https?:\/\/\S+\.\S+/.test(url.trim());
}

/**
 * Espaço reservado ao logotipo oficial. Enquanto nenhum arquivo for
 * cadastrado no painel, exibe apenas o nome da instituição em texto —
 * nenhum logotipo é inventado. Com um link configurado, tocar no logotipo
 * abre a página (ex.: cursos de graduação) em outra aba, sem fechar o jogo.
 */
export function Logo({ size = 'lg', onDark = false }: { size?: 'sm' | 'lg'; onDark?: boolean }) {
  const { settings } = useAppData();
  const height = size === 'lg' ? 'h-[4.4rem]' : 'h-[2.4rem]';

  const linked = (content: ReactNode) =>
    isWebUrl(settings.logoLinkUrl) ? (
      <a
        href={settings.logoLinkUrl.trim()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          // Abre por código: funciona no APK e quando a nova aba é bloqueada.
          e.preventDefault();
          void openExternal(settings.logoLinkUrl.trim());
        }}
        aria-label={`${settings.institutionName}: conheça os cursos de graduação (abre o site em outra aba)`}
        className="inline-flex rounded-full transition-transform active:scale-95"
      >
        {content}
      </a>
    ) : (
      content
    );

  if (onDark && settings.logoOnDark) {
    return linked(<img src={settings.logoOnDark} alt={settings.institutionName} className={`${height} w-auto max-w-[70%] object-contain`} />);
  }
  if (settings.logo) {
    const img = <img src={settings.logo} alt={settings.institutionName} className={`${height} w-auto max-w-full object-contain`} />;
    // Sobre o vinho, o logotipo colorido vai numa cápsula branca (como no cabeçalho do site).
    return linked(
      onDark ? (
        <div className={`rounded-full bg-white shadow-[0_0.5rem_1.6rem_rgb(0_0_0/0.25)] ${size === 'lg' ? 'px-[2.2rem] py-[1rem]' : 'px-[1.2rem] py-[0.45rem]'}`}>{img}</div>
      ) : (
        img
      ),
    );
  }
  // Tamanho grande (tela inicial): espaço reservado vazio, pois o nome da
  // instituição já aparece logo abaixo do logotipo.
  if (size === 'lg') return <div className={height} aria-hidden="true" />;
  return linked(
    <div className={`${height} flex items-center`} aria-label={settings.institutionName}>
      <span className="font-display text-[0.85rem] font-bold uppercase tracking-[0.22em] text-heading">{settings.institutionName}</span>
    </div>,
  );
}
