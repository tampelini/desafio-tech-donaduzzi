import type { CapacitorConfig } from '@capacitor/cli';

// appId é o identificador interno do pacote Android (não é uma URL).
// Pode ser alterado antes da primeira instalação definitiva.
const config: CapacitorConfig = {
  appId: 'br.edu.donaduzzi.desafiotech',
  appName: 'Desafio Tech',
  webDir: 'dist',
  android: {
    backgroundColor: '#541822',
    // Conteúdo 100% local: nada é carregado da internet.
    allowMixedContent: false,
  },
};

export default config;
