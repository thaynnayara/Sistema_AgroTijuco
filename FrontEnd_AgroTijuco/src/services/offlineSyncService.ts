/**
 * RNF01 & RNF02 - Arquitetura Offline-First & Sincronização Assíncrona
 * Permite registrar pesagens, manejos sanitários e cadastros de campo mesmo sem conexão com a internet,
 * sincronizando os dados automaticamente com o backend ao detectar sinal de rede.
 */

export interface OperacaoOffline {
  id: string;
  tipo: 'PESAGEM' | 'ANIMAL' | 'SANIDADE' | 'REPRODUCAO';
  url: string;
  metodo: 'POST' | 'PUT' | 'PATCH';
  payload: any;
  timestamp: string;
}

const STORAGE_KEY = 'agrotijuco_offline_queue_v1';

export const offlineSyncService = {
  salvarOperacaoOffline(tipo: OperacaoOffline['tipo'], url: string, metodo: OperacaoOffline['metodo'], payload: any): void {
    const operacoes = this.obterFila();
    const novaOperacao: OperacaoOffline = {
      id: 'off_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      tipo,
      url,
      metodo,
      payload,
      timestamp: new Date().toISOString()
    };
    operacoes.push(novaOperacao);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(operacoes));
  },

  obterFila(): OperacaoOffline[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  limparFila(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  removerOperacao(id: string): void {
    const fila = this.obterFila().filter(op => op.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fila));
  },

  async sincronizar(apiInstance: any): Promise<{ processados: number; erros: number }> {
    const fila = this.obterFila();
    if (fila.length === 0) return { processados: 0, erros: 0 };

    let processados = 0;
    let erros = 0;

    for (const item of fila) {
      try {
        if (item.metodo === 'POST') {
          await apiInstance.post(item.url, item.payload);
        } else if (item.metodo === 'PATCH') {
          await apiInstance.patch(item.url, item.payload);
        }
        this.removerOperacao(item.id);
        processados++;
      } catch (err) {
        console.error('Erro ao sincronizar operação offline:', item, err);
        erros++;
      }
    }

    return { processados, erros };
  }
};
