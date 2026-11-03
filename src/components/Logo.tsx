import { useAppData } from '../store/AppDataContext';

/**
 * Espaço reservado ao logotipo oficial. Enquanto nenhum arquivo for
 * cadastrado no painel, exibe apenas o nome da instituição em texto —
 * nenhum logotipo é inventado.
 */
export function Logo({ size = 'lg', onDark = false }: { size?: 'sm' | 'lg'; onDark?: boolean }) {
  const { settings } = useAppData();
  const height = size === 'lg' ? 'h-[4.4rem]' : 'h-[2.4rem]';
  if (onDark && settings.logoOnDark) {
    return <img src={settings.logoOnDark} alt={settings.institutionName} className={`${height} w-auto max-w-[70%] object-contain`} />;
  }
  if (settings.logo) {
    const img = <img src={settings.logo} alt={settings.institutionName} className={`${height} w-auto max-w-full object-contain`} />;
    // Sobre o vinho, o logotipo colorido vai numa cápsula branca (como no cabeçalho do site).
    return onDark ? (
      <div className={`rounded-full bg-white shadow-[0_0.5rem_1.6rem_rgb(0_0_0/0.25)] ${size === 'lg' ? 'px-[2.2rem] py-[1rem]' : 'px-[1.2rem] py-[0.45rem]'}`}>{img}</div>
    ) : (
      img
    );
  }
  // Tamanho grande (tela inicial): espaço reservado vazio, pois o nome da
  // instituição já aparece logo abaixo do logotipo.
  if (size === 'lg') return <div className={height} aria-hidden="true" />;
  return (
    <div className={`${height} flex items-center`} aria-label={settings.institutionName}>
      <span
        className="font-display text-[0.85rem] font-bold uppercase tracking-[0.22em] text-heading"
      >
        {settings.institutionName}
      </span>
    </div>
  );
}
