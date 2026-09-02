/**
 * Interface para a resposta de autenticação JWT e dados do usuário/tenant (B2B Multi-tenant)
 */
export interface User {
  id: string; // UUID
  nome: string;
  email: string;
  perfil: 'GESTOR' | 'ADMIN' | 'PRODUTOR' | 'OPERADOR';
  role?: 'GESTOR' | 'ADMIN' | 'PRODUTOR' | 'OPERADOR';
  tenantId: string; // Multi-tenancy isolation key
  produtorId?: string; // UUID do produtor
  produtorNome?: string;
}

export interface AuthResponse {
  token: string;
  usuario: User;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

/**
 * Entidade Produtor (UUID)
 */
export interface Produtor {
  id?: string;
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  endereco?: string;
  dataCriacao?: string;
  totalPropriedades?: number;
}

export type CreateProdutorInput = Omit<Produtor, 'id' | 'dataCriacao' | 'totalPropriedades'>;

/**
 * Entidade Propriedade (UUID) vinculada a um Produtor
 */
export interface Propriedade {
  id?: string;
  nome: string;
  nomeFazenda?: string;
  inscricaoEstadual?: string;
  municipio?: string;
  areaHectares: number;
  localizacao?: string;
  produtorId?: string;
  produtorNome?: string;
  totalAnimais?: number;
}

export type CreatePropriedadeInput = Omit<Propriedade, 'id' | 'produtorId' | 'produtorNome' | 'totalAnimais'>;

/**
 * RF01 & RF05 - Entidade Animal (UUID)
 */
export interface Animal {
  id?: string;
  brinco: string;
  rfid?: string;
  lote?: string;
  piqueteId?: string;
  nomePiquete?: string;
  nome?: string;
  raca: string;
  sexo: 'M' | 'F' | 'MACHO' | 'FEMEA';
  dataNascimento?: string;
  pesoInicialKg?: number;
  pesoAtualKg?: number;
  propriedadeId?: string;
  nomeFazenda?: string;
  status: 'ATIVO' | 'VENDIDO' | 'ABATIDO' | 'MORTO' | 'EM_TRATAMENTO';
  emCarenciaSanitaria?: boolean;
  dataFimCarencia?: string;
}

export interface BatchAnimalInput {
  prefixoBrinco: string;
  quantidade: number;
  sexo: 'M' | 'F';
  raca: string;
  lote: string;
  dataNascimento?: string;
  piqueteId?: string;
}

/**
 * RF04 & RN01 - Entidade Pesagem
 */
export interface Pesagem {
  id?: string;
  animalId?: string;
  brincoAnimal?: string;
  dataPesagem: string;
  pesoKg: number;
  gmdKgDia?: number; // RN01 Ganho Médio Diário
  diasEntrePesagens?: number;
  observacao?: string;
}

/**
 * RF02 - Gestão Reprodutiva
 */
export interface EventoReprodutivo {
  id?: string;
  animalId: string;
  brincoAnimal?: string;
  tipo: 'INSEMINACAO' | 'IATF' | 'TOQUE' | 'PARTO' | 'SECAGEM';
  dataEvento: string;
  dataPrevisaoProximaEtapa?: string;
  observacao?: string;
}

/**
 * RF03 & RN02 - Calendário Sanitário e Carência
 */
export interface RegistroSanitario {
  id?: string;
  animalId?: string;
  brincoAnimal?: string;
  lote?: string;
  medicamentoVacina: string;
  tipo: 'VACINA' | 'VERMIFUGO' | 'ANTIBIOTICO' | 'OUTRO';
  dose?: string;
  dataAplicacao: string;
  diasCarencia: number;
  dataFimCarencia?: string;
  observacao?: string;
}

/**
 * RF05 - Gestão de Pastagens e Piquetes
 */
export interface Piquete {
  id?: string;
  propriedadeId?: string;
  nomePiquete: string;
  areaHectares: number;
  capacidadeCabecas: number;
  tipoCapim?: string;
  observacao?: string;
  animaisAlocadosCount?: number;
}

/**
 * RF06 - Controle Nutricional
 */
export interface DietaTrato {
  id?: string;
  propriedadeId?: string;
  nomeDieta: string;
  ingredientes: string;
  quantidadeKgCabeca: number;
  loteDestino?: string;
  dataTrato: string;
  observacoes?: string;
}

/**
 * RF07 & RN03 - Financeiro, Apuração de Custos e Taxa de Desfrute
 */
export interface DespesaOperacional {
  id?: string;
  propriedadeId?: string;
  descricao: string;
  categoria: 'RACAO' | 'MEDICAMENTOS' | 'MAO_DE_OBRA' | 'MANUTENCAO' | 'COMBUSTIVEL' | 'OUTROS';
  valor: number;
  dataDespesa: string;
  tipoProducao?: 'CORTE_ARROBA' | 'LEITE_LITRO';
  totalProduzidoPeriodo?: number;
}

export interface ResumoApuracaoCustos {
  totalDespesas: number;
  custoPorArroba: number;
  custoPorLitroLeite: number;
  taxaDesfrutePercentual: number;
  totalRebanho: number;
  comercializadosNoAno: number;
}

/**
 * RF08 - Gestão de Estoque
 */
export interface ItemEstoque {
  id?: string;
  propriedadeId?: string;
  nomeItem: string;
  categoria: 'RACAO' | 'MEDICAMENTO' | 'SUPLEMENTO' | 'FERRAMENTA' | 'OUTROS';
  quantidadeAtual: number;
  quantidadeMinima: number;
  unidadeMedida: 'KG' | 'LITRO' | 'UNIDADE' | 'DOSE' | 'SACO';
  estoqueBaixo?: boolean;
}
