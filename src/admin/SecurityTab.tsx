import { useEffect, useState } from 'react';
import { DEFAULT_PIN, isDefaultPin, setPin } from '../services/pin';
import { Btn, Card, Field, Notice } from './ui';

export function SecurityTab() {
  const [isDefault, setIsDefault] = useState(false);
  const [pin, setPinValue] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    void isDefaultPin().then(setIsDefault);
  }, []);

  async function save() {
    if (pin !== confirm) return setMsg({ tone: 'error', text: 'Os PINs não coincidem.' });
    try {
      await setPin(pin);
      setIsDefault(false);
      setPinValue('');
      setConfirm('');
      setMsg({ tone: 'ok', text: 'PIN alterado.' });
    } catch (e) {
      setMsg({ tone: 'error', text: (e as Error).message });
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      {isDefault && <Notice tone="warn">O PIN padrão ({DEFAULT_PIN}) ainda está em uso. Altere-o antes de levar o totem a um evento.</Notice>}
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      <Card title="Alterar PIN de acesso">
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <Field label="Novo PIN (4 a 12 dígitos)">
            <input type="password" inputMode="numeric" autoComplete="new-password" value={pin} onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ''))} />
          </Field>
          <Field label="Confirmar novo PIN">
            <input type="password" inputMode="numeric" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ''))} />
          </Field>
          <Btn tone="primary" type="submit" disabled={pin.length < 4}>
            Salvar PIN
          </Btn>
        </form>
      </Card>
      <Card title="Como acessar o painel">
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink/85">
          <li>Na tela do jogo, toque 5 vezes rapidamente no canto superior esquerdo (área invisível), ou</li>
          <li>acesse o endereço do jogo terminado em <code>#/admin</code>.</li>
          <li>A sessão administrativa é encerrada após 5 minutos sem uso.</li>
          <li>Após 5 PINs incorretos, o acesso fica bloqueado por 1 minuto.</li>
        </ul>
      </Card>
    </div>
  );
}
