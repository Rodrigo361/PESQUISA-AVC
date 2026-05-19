export const TIPO_AVC_MAP: Record<string, string> = {
  '1': 'Isquêmico',
  '2': 'Hemorrágico intraparenquimatoso',
  '3': 'Hemorragia subaracnoide',
  '4': 'AIT',
};

export const SEXO_MAP: Record<string, string> = {
  'M': 'Masculino',
  'F': 'Feminino',
};

export const RACA_MAP: Record<string, string> = {
  '1': 'Branco',
  '2': 'Preto',
  '3': 'Pardo',
  '4': 'Amarelo',
  '5': 'Indígena',
  '6': 'Outro',
};

export const ESCOLARIDADE_MAP: Record<string, string> = {
  '0': 'Analfabeto',
  '1': 'Fund. Incompleto',
  '2': 'Fund. Completo',
  '3': 'Médio Incompleto',
  '4': 'Médio Completo',
  '5': 'Superior Incompleto',
  '6': 'Superior Completo',
};

export const SIM_NAO_MAP: Record<string, string> = {
  '1': 'Sim',
  '2': 'Não',
  '3': 'Não se aplica / Não sabe',
};

export const TABAGISMO_MAP: Record<string, string> = {
  '1': 'Fumante atual',
  '2': 'Ex-fumante',
  '3': 'Nunca fumou',
};

export const TRATAMENTO_MAP: Record<string, string> = {
  '1': 'Trombólise IV',
  '2': 'Trombectomia',
  '3': 'Ambos',
  '4': 'Clínico exclusivo',
};

export const TROMBOLISE_JANELA_MAP: Record<string, string> = {
  '1': 'Sim',
  '2': 'Não',
  '3': 'Não se aplica',
};

export const TIPO_INICIO_MAP: Record<string, string> = {
  '1': 'Súbito',
  '2': 'Progressivo',
  '3': 'Ao acordar',
};

export const RECONHECEU_SINTOMAS_MAP: Record<string, string> = {
  '1': 'Sim',
  '2': 'Não',
  '3': 'Suspeitou',
};

export const QUEM_RECONHECEU_MAP: Record<string, string> = {
  '1': 'Paciente',
  '2': 'Familiar',
  '3': 'Profissional',
  '4': 'Outro',
};

export const TEMPO_BUSCA_MAP: Record<string, string> = {
  '1': '< 1h',
  '2': '1-3h',
  '3': '3-6h',
  '4': '> 6h',
};

export const LOCAL_ATENDIMENTO_MAP: Record<string, string> = {
  '1': 'UBS',
  '2': 'Hospital municipal',
  '3': 'UPA',
  '4': 'SCMS',
  '5': 'HRN',
  '6': 'Outro',
};

export const TRANSPORTE_MAP: Record<string, string> = {
  '1': 'SAMU',
  '2': 'Ambulância não SAMU',
  '3': 'Particular',
  '4': 'Táxi/moto',
  '5': 'Outro',
};

export const MOTIVO_TRANSFERENCIA_MAP: Record<string, string> = {
  '1': 'Tomografia',
  '2': 'Unidade AVC',
  '3': 'Trombólise/trombectomia',
  '4': 'Outro',
};

export const DESTINO_ALTA_MAP: Record<string, string> = {
  '1': 'Domicílio',
  '2': 'Transferência',
  '3': 'Óbito',
};

export const COMPLICACOES_MAP: Record<string, string> = {
  '1': 'Pneumonia aspirativa',
  '2': 'ITU',
  '3': 'TVP',
  '4': 'Outra',
  '5': 'Nenhuma',
};

export const OCUPACAO_MAP: Record<string, string> = {
  '1': 'Trabalho manual',
  '2': 'Não manual',
  '3': 'Aposentado',
  '4': 'Desempregado',
  '5': 'Outro',
};

export const UNIDADE_DESTINO_MAP: Record<string, string> = {
  '1': 'SCMS',
  '2': 'HRN',
  '3': 'Outro',
};

export const EVENTOS_PREVIOS_MAP: Record<string, string> = {
  '1': 'Um',
  '2': 'Dois',
  '3': 'Três ou mais',
};

export const TEMPO_DIAGNOSTICO_MAP: Record<string, string> = {
  '1': '< 1 ano',
  '2': '1-5 anos',
  '3': '> 5 anos',
  '4': 'Não sabe',
};

export const ADESAO_MAP: Record<string, string> = {
  '1': 'Regular',
  '2': 'Irregular',
  '3': 'Não usa',
};

export const CONSUMO_ALCOOL_MAP: Record<string, string> = {
  '1': 'Nunca',
  '2': 'Até 1x/semana',
  '3': '2-4x/semana',
  '4': '5+/semana',
};

export const HISTORICO_FAMILIAR_MAP: Record<string, string> = {
  '1': 'Sim',
  '2': 'Não',
  '3': 'Não sabe',
};

export function resolveLabel(map: Record<string, string>, value: string | boolean | undefined | null): string {
  if (value === undefined || value === null || value === '') return '—';
  const strValue = String(value);
  return map[strValue] || strValue;
}

export function str(v: any): string {
  if (v === null || v === undefined) return '';
  return String(v).toLowerCase();
}
