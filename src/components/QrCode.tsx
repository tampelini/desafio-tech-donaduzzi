import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/** QR Code gerado localmente (sem serviço externo), a partir da URL configurada. */
export function QrCode({ value, className = '' }: { value: string; className?: string }) {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    let alive = true;
    if (!value) {
      setSvg('');
      return;
    }
    QRCode.toString(value, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#541822', light: '#ffffff' } })
      .then((s) => alive && setSvg(s))
      .catch(() => alive && setSvg(''));
    return () => {
      alive = false;
    };
  }, [value]);
  if (!value) return null;
  // Enquanto o código é gerado, ocupa o mesmo espaço (evita deslocar o layout).
  if (!svg) return <div className={`rounded-xl bg-white ${className}`} aria-hidden="true" />;
  return (
    <div
      className={`overflow-hidden rounded-xl bg-white p-2 [&>svg]:h-full [&>svg]:w-full ${className}`}
      role="img"
      aria-label={`QR Code para ${value}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
