export type FieldType = 'texto' | 'data' | 'datetime' | 'calculado' | 'select' | 'multiselect' | 'numero' | 'telefone';

export interface FormOption {
  value: string;
  label: string;
}

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  description?: string;
  options?: FormOption[];
  condition?: {
    field: string;
    value: string | string[];
  };
  calculation?: string;
  min?: number;
  max?: number;
}

export interface FormBlock {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormDefinition {
  blocks: FormBlock[];
}

export const DEFAULT_FORM_DEFINITION: FormDefinition = {
  blocks: [
    {
      id: 'bloco1',
      title: 'BLOCO 1 – IDENTIFICAÇÃO',
      fields: [
        { id: 'prontuario_id', label: 'Matrícula do prontuário', type: 'texto' },
        { id: 'nome_completo', label: 'Nome do paciente', type: 'texto' },
        { id: 'data_nascimento', label: 'Data de nascimento', type: 'data' },
        { id: 'idade', label: 'Idade automática', type: 'calculado', calculation: 'idade' },
        { id: 'idade_confirmada', label: 'Confirmação da idade', type: 'select', options: [{ value: '1', label: 'Correta' }, { value: '2', label: 'Ajustada' }] },
        { id: 'sexo', label: 'Sexo', type: 'select', options: [{ value: '1', label: 'Masculino' }, { value: '2', label: 'Feminino' }] },
        { id: 'raca_ibge', label: 'Raça', type: 'select', options: [{ value: '1', label: 'Branco' }, { value: '2', label: 'Preto' }, { value: '3', label: 'Pardo' }, { value: '4', label: 'Amarelo' }, { value: '5', label: 'Indígena' }, { value: '6', label: 'Outro' }] },
        { id: 'escolaridade', label: 'Escolaridade', type: 'select', options: [{ value: '0', label: 'Analfabeto' }, { value: '1', label: 'Fundamental incompleto' }, { value: '2', label: 'Fundamental completo' }, { value: '3', label: 'Médio incompleto' }, { value: '4', label: 'Médio completo' }, { value: '5', label: 'Superior incompleto' }, { value: '6', label: 'Superior completo' }] },
        { id: 'municipio', label: 'Município', type: 'select', options: [{ value: '1', label: 'Acaraú' }, { value: '2', label: 'Alcântaras' }, { value: '3', label: 'Ararendá' }, { value: '4', label: 'Barroquinha' }, { value: '5', label: 'Bela Cruz' }, { value: '6', label: 'Camocim' }, { value: '7', label: 'Cariré' }, { value: '8', label: 'Carnaubal' }, { value: '9', label: 'Catunda' }, { value: '10', label: 'Chaval' }, { value: '11', label: 'Coreaú' }, { value: '12', label: 'Crateús' }, { value: '13', label: 'Croatá' }, { value: '14', label: 'Cruz' }, { value: '15', label: 'Forquilha' }, { value: '16', label: 'Frecheirinha' }, { value: '17', label: 'Graça' }, { value: '18', label: 'Granja' }, { value: '19', label: 'Groaíras' }, { value: '20', label: 'Guaraciaba do Norte' }, { value: '21', label: 'Hidrolândia' }, { value: '22', label: 'Ibiapina' }, { value: '23', label: 'Independência' }, { value: '24', label: 'Ipaporanga' }, { value: '25', label: 'Ipu' }, { value: '26', label: 'Ipueiras' }, { value: '27', label: 'Irauçuba' }, { value: '28', label: 'Itarema' }, { value: '29', label: 'Jijoca de Jericoacoara' }, { value: '30', label: 'Marco' }, { value: '31', label: 'Martinópole' }, { value: '32', label: 'Massapê' }, { value: '33', label: 'Meruoca' }, { value: '34', label: 'Monsenhor Tabosa' }, { value: '35', label: 'Moraújo' }, { value: '36', label: 'Morrinhos' }, { value: '37', label: 'Mucambo' }, { value: '38', label: 'Nova Russas' }, { value: '39', label: 'Novo Oriente' }, { value: '40', label: 'Pacujá' }, { value: '41', label: 'Pires Ferreira' }, { value: '42', label: 'Poranga' }, { value: '43', label: 'Quiterianópolis' }, { value: '44', label: 'Reriutaba' }, { value: '45', label: 'Santa Quitéria' }, { value: '46', label: 'Santana do Acaraú' }, { value: '47', label: 'São Benedito' }, { value: '48', label: 'Senador Sá' }, { value: '49', label: 'Sobral' }, { value: '50', label: 'Tamboril' }, { value: '51', label: 'Tianguá' }, { value: '52', label: 'Ubajara' }, { value: '53', label: 'Uruoca' }, { value: '54', label: 'Varjota' }, { value: '55', label: 'Viçosa do Ceará' }] },
        { id: 'ocupacao', label: 'Ocupação', type: 'select', options: [{ value: '1', label: 'Trabalho manual' }, { value: '2', label: 'Trabalho não manual' }, { value: '3', label: 'Aposentado' }, { value: '4', label: 'Desempregado' }, { value: '5', label: 'Outro' }] },
        { id: 'responsavel_nome', label: 'Nome do responsável', type: 'texto' },
        { id: 'responsavel_parentesco', label: 'Parentesco', type: 'select', options: [{ value: '1', label: 'Pai/Mãe' }, { value: '2', label: 'Filho(a)' }, { value: '3', label: 'Cônjuge' }, { value: '4', label: 'Acompanhante' }, { value: '5', label: 'Outro' }] },
        { id: 'telefone_principal', label: 'Telefone Principal', type: 'telefone' },
        { id: 'telefone_secundario', label: 'Telefone Secundário', type: 'telefone' }
      ]
    },
    {
      id: 'bloco2',
      title: 'BLOCO 2 – EVENTO AGUDO',
      fields: [
        { id: 'inicio_sintomas', label: 'Início dos sintomas', type: 'datetime' },
        { id: 'tipo_inicio', label: 'Tipo de início', type: 'select', options: [{ value: '1', label: 'Súbito' }, { value: '2', label: 'Progressivo' }, { value: '3', label: 'Ao acordar' }, { value: '4', label: 'Achado daquela forma' }] },
        { id: 'ultima_vez_bem', label: 'Última vez visto bem', type: 'datetime', condition: { field: 'tipo_inicio', value: ['3', '4'] } },
        { id: 'reconheceu_avc', label: 'Reconheceu AVC', type: 'select', options: [{ value: '1', label: 'Sim' }, { value: '2', label: 'Não' }, { value: '3', label: 'Suspeitou' }] },
        { id: 'quem_reconheceu', label: 'Quem reconheceu', type: 'select', options: [{ value: '1', label: 'Paciente' }, { value: '2', label: 'Familiar' }, { value: '3', label: 'Profissional' }, { value: '4', label: 'Outro' }], condition: { field: 'reconheceu_avc', value: ['1', '3'] } },
        { id: 'chamada_ajuda', label: 'Solicitação de ajuda', type: 'datetime' },
        { id: 'chegada_primeiro_servico', label: 'Chegada ao primeiro serviço', type: 'datetime' },
        { id: 'local_primeiro_atendimento', label: 'Local do primeiro atendimento', type: 'select', options: [{ value: '1', label: 'UBS' }, { value: '2', label: 'Hospital municipal' }, { value: '3', label: 'UPA' }, { value: '4', label: 'SCMS' }, { value: '5', label: 'HRN' }, { value: '6', label: 'Outro' }] },
        { id: 'transporte_inicial', label: 'Transporte inicial', type: 'select', options: [{ value: '1', label: 'SAMU' }, { value: '2', label: 'Ambulância' }, { value: '3', label: 'Particular' }, { value: '4', label: 'Táxi/Moto' }, { value: '5', label: 'Outro' }] }
      ]
    },
    {
      id: 'bloco3',
      title: 'BLOCO 3 – TRANSFERÊNCIA',
      fields: [
        { id: 'transferencia', label: 'Transferência', type: 'select', options: [{ value: '1', label: 'Sim' }, { value: '2', label: 'Não' }] },
        { id: 'saida_servico_origem', label: 'Saída do serviço de origem', type: 'datetime', condition: { field: 'transferencia', value: '1' } },
        { id: 'chegada_destino', label: 'Chegada ao destino', type: 'datetime', condition: { field: 'transferencia', value: '1' } },
        { id: 'unidade_destino', label: 'Unidade de destino', type: 'select', options: [{ value: '1', label: 'SCMS' }, { value: '2', label: 'HRN' }, { value: '3', label: 'Outro' }], condition: { field: 'transferencia', value: '1' } },
        { id: 'transporte_transferencia', label: 'Transporte da transferência', type: 'select', options: [{ value: '1', label: 'SAMU' }, { value: '2', label: 'Ambulância municipal' }, { value: '3', label: 'Particular' }, { value: '4', label: 'Outro' }], condition: { field: 'transferencia', value: '1' } },
        { id: 'motivo_transferencia', label: 'Motivo da transferência', type: 'select', options: [{ value: '1', label: 'Tomografia' }, { value: '2', label: 'Unidade AVC' }, { value: '3', label: 'Trombólise/Trombectomia' }, { value: '4', label: 'Outro' }], condition: { field: 'transferencia', value: '1' } }
      ]
    },
    {
      id: 'bloco4',
      title: 'BLOCO 4 – DIAGNÓSTICO E TRATAMENTO',
      fields: [
        { id: 'tipo_avc', label: 'Tipo de AVC', type: 'select', options: [{ value: '1', label: 'Isquêmico' }, { value: '2', label: 'Hemorragia intraparenquimatosa' }, { value: '3', label: 'HSA' }, { value: '4', label: 'AIT' }] },
        { id: 'tomografia_datetime', label: 'Data/Hora da Tomografia', type: 'datetime' },
        { id: 'nihss', label: 'NIHSS', type: 'numero', min: 0, max: 42 },
        { id: 'glasgow', label: 'Glasgow', type: 'numero', min: 3, max: 15 },
        { id: 'rankin_previo', label: 'Rankin Prévio', type: 'numero', min: 0, max: 6 },
        { id: 'pa_sistolica', label: 'PA Sistólica', type: 'numero' },
        { id: 'pa_diastolica', label: 'PA Diastólica', type: 'numero' },
        { id: 'glicemia', label: 'Glicemia', type: 'numero' },
        { id: 'saturacao_o2', label: 'Saturação O2', type: 'numero' },
        { id: 'uso_o2', label: 'Uso de O2', type: 'select', options: [{ value: '1', label: 'Sim' }, { value: '2', label: 'Não' }] },
        { id: 'tipo_dispositivo_o2', label: 'Tipo de dispositivo de O2', type: 'select', options: [{ value: '1', label: 'Cateter nasal' }, { value: '2', label: 'Intubação' }, { value: '3', label: 'Máscara não reinalante' }, { value: '4', label: 'Outro' }], condition: { field: 'uso_o2', value: '1' } },
        { id: 'temperatura', label: 'Temperatura', type: 'numero' },
        { id: 'unidade_avc', label: 'Unidade AVC', type: 'select', options: [{ value: '1', label: 'Sim' }, { value: '2', label: 'Não' }] },
        { id: 'trombolise', label: 'Trombólise', type: 'select', options: [{ value: '1', label: 'Sim' }, { value: '2', label: 'Não' }] },
        { id: 'trombectomia', label: 'Trombectomia', type: 'select', options: [{ value: '1', label: 'Sim' }, { value: '2', label: 'Não' }] },
        { id: 'motivo_nao_trombolise', label: 'Motivo não trombólise', type: 'select', options: [{ value: '1', label: 'Fora da janela' }, { value: '2', label: 'Contraindicação' }, { value: '3', label: 'Atraso diagnóstico' }, { value: '4', label: 'Sem estrutura' }, { value: '5', label: 'Outro' }], condition: { field: 'trombolise', value: '2' } },
        { id: 'inicio_tratamento', label: 'Início do tratamento', type: 'datetime' }
      ]
    },
    {
      id: 'bloco5',
      title: 'BLOCO 5 – AVC PRÉVIO',
      fields: [
        { id: 'avc_previo', label: 'AVC prévio', type: 'select', options: [{ value: '1', label: 'Sim' }, { value: '2', label: 'Não' }, { value: '3', label: 'Não sabe' }] },
        { id: 'num_avc_previos', label: 'Número de AVCs prévios', type: 'select', options: [{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3+' }], condition: { field: 'avc_previo', value: '1' } },
        { id: 'data_ultimo_avc', label: 'Data do último AVC', type: 'data', condition: { field: 'avc_previo', value: '1' } },
        { id: 'tipo_avc_previo', label: 'Tipo de AVC prévio', type: 'select', options: [{ value: '1', label: 'Isquêmico' }, { value: '2', label: 'Hemorrágico' }, { value: '3', label: 'AIT' }], condition: { field: 'avc_previo', value: '1' } },
        { id: 'reabilitacao', label: 'Reabilitação', type: 'multiselect', options: [{ value: '1', label: 'Não' }, { value: '2', label: 'Fisioterapia' }, { value: '3', label: 'Fono' }, { value: '4', label: 'TO' }, { value: '5', label: 'Psicologia' }, { value: '6', label: 'Multidisciplinar' }], condition: { field: 'avc_previo', value: '1' } },
        { id: 'sequelas_previas', label: 'Sequelas prévias', type: 'select', options: [{ value: '1', label: 'Sim' }, { value: '2', label: 'Não' }], condition: { field: 'avc_previo', value: '1' } }
      ]
    },
    {
      id: 'bloco6',
      title: 'BLOCO 6 – FATORES DE RISCO',
      fields: [
        { id: 'hipertensao', label: 'Hipertensão', type: 'select', options: [{ value: '1', label: 'Sim' }, { value: '2', label: 'Não' }] },
        { id: 'tratamento_hipertensao', label: 'Tratamento Hipertensão', type: 'select', options: [{ value: '1', label: 'Regular' }, { value: '2', label: 'Irregular' }, { value: '3', label: 'Não faz' }], condition: { field: 'hipertensao', value: '1' } },
        { id: 'diabetes', label: 'Diabetes', type: 'select', options: [{ value: '1', label: 'Sim' }, { value: '2', label: 'Não' }] },
        { id: 'tratamento_diabetes', label: 'Tratamento Diabetes', type: 'select', options: [{ value: '1', label: 'Regular' }, { value: '2', label: 'Irregular' }, { value: '3', label: 'Não faz' }], condition: { field: 'diabetes', value: '1' } },
        { id: 'dislipidemia', label: 'Dislipidemia', type: 'select', options: [{ value: '1', label: 'Sim' }, { value: '2', label: 'Não' }] },
        { id: 'tratamento_dislipidemia', label: 'Tratamento Dislipidemia', type: 'select', options: [{ value: '1', label: 'Regular' }, { value: '2', label: 'Irregular' }, { value: '3', label: 'Não faz' }], condition: { field: 'dislipidemia', value: '1' } },
        { id: 'tabagismo', label: 'Tabagismo', type: 'select', options: [{ value: '1', label: 'Atual' }, { value: '2', label: 'Ex-fumante' }, { value: '3', label: 'Nunca' }] },
        { id: 'alcool', label: 'Álcool', type: 'select', options: [{ value: '1', label: 'Nunca' }, { value: '2', label: '1x/semana' }, { value: '3', label: '2-4x/semana' }, { value: '4', label: '5+' }] },
        { id: 'atividade_fisica', label: 'Atividade Física', type: 'select', options: [{ value: '1', label: 'Sim' }, { value: '2', label: 'Não' }] },
        { id: 'historico_familiar', label: 'Histórico Familiar', type: 'select', options: [{ value: '1', label: 'Sim' }, { value: '2', label: 'Não' }, { value: '3', label: 'Não sabe' }] },
        { id: 'fibrilacao_atrial', label: 'Fibrilação Atrial', type: 'select', options: [{ value: '1', label: 'Sim' }, { value: '2', label: 'Não' }] },
        { id: 'tratamento_fibrilacao', label: 'Tratamento Fibrilação Atrial', type: 'select', options: [{ value: '1', label: 'Regular' }, { value: '2', label: 'Irregular' }, { value: '3', label: 'Não faz' }], condition: { field: 'fibrilacao_atrial', value: '1' } },
        { id: 'anticoagulante', label: 'Anticoagulante', type: 'select', options: [{ value: '1', label: 'Sim' }, { value: '2', label: 'Não' }] },
        { id: 'antiagregante', label: 'Antiagregante', type: 'select', options: [{ value: '1', label: 'Sim' }, { value: '2', label: 'Não' }] },
        { id: 'doenca_renal', label: 'Doença Renal', type: 'select', options: [{ value: '1', label: 'Sim' }, { value: '2', label: 'Não' }] },
        { id: 'tratamento_doenca_renal', label: 'Tratamento Doença Renal', type: 'select', options: [{ value: '1', label: 'Regular' }, { value: '2', label: 'Irregular' }, { value: '3', label: 'Não faz' }], condition: { field: 'doenca_renal', value: '1' } },
        { id: 'peso', label: 'Peso (kg)', type: 'numero' },
        { id: 'altura', label: 'Altura (m)', type: 'numero' },
        { id: 'imc', label: 'IMC', type: 'calculado', calculation: 'imc' }
      ]
    },
    {
      id: 'bloco7',
      title: 'BLOCO 7 – DESFECHO',
      fields: [
        { id: 'desfecho_tipo', label: 'Desfecho do Paciente', type: 'select', options: [{ value: '1', label: 'Alta' }, { value: '2', label: 'Óbito' }] },
        
        { id: 'data_alta', label: 'Data e Hora da Alta', type: 'datetime', condition: { field: 'desfecho_tipo', value: '1' } },
        { id: 'destino_alta', label: 'Destino da alta', type: 'select', options: [{ value: '1', label: 'Domicílio' }, { value: '2', label: 'Transferência' }], condition: { field: 'desfecho_tipo', value: '1' } },
        { id: 'complicacoes_alta', label: 'Complicações na Alta', type: 'multiselect', options: [{ value: '1', label: 'Pneumonia' }, { value: '2', label: 'ITU' }, { value: '3', label: 'TVP' }, { value: '4', label: 'Outra' }, { value: '5', label: 'Nenhuma' }], condition: { field: 'desfecho_tipo', value: '1' } },
        { id: 'outra_complicacao_alta', label: 'Qual outra complicação?', type: 'texto', condition: { field: 'complicacoes_alta', value: '4' } },
        { id: 'rankin_alta', label: 'Rankin da alta', type: 'numero', min: 0, max: 6, condition: { field: 'desfecho_tipo', value: '1' } },
        { id: 'encaminhamento_reabilitacao', label: 'Encaminhamento Reabilitação', type: 'select', options: [{ value: '1', label: 'Sim' }, { value: '2', label: 'Não' }], condition: { field: 'desfecho_tipo', value: '1' } },
        
        { id: 'data_hora_obito', label: 'Data e Hora do Óbito', type: 'datetime', condition: { field: 'desfecho_tipo', value: '2' } },
        { id: 'complicacoes_obito', label: 'Complicações até o Óbito', type: 'multiselect', options: [{ value: '1', label: 'Pneumonia' }, { value: '2', label: 'ITU' }, { value: '3', label: 'TVP' }, { value: '4', label: 'Outra' }, { value: '5', label: 'Nenhuma' }], condition: { field: 'desfecho_tipo', value: '2' } },
        { id: 'outra_complicacao_obito', label: 'Qual outra complicação?', type: 'texto', condition: { field: 'complicacoes_obito', value: '4' } },
        { id: 'causa_obito', label: 'Causa do Óbito', type: 'texto', condition: { field: 'desfecho_tipo', value: '2' } },
        
        { id: 'dias_internacao', label: 'Dias de internação', type: 'calculado', calculation: 'dias_internacao' }
      ]
    }
  ]
};

export function getFormDefinition(): FormDefinition {
  const stored = localStorage.getItem('form_definition');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse form definition', e);
    }
  }
  return DEFAULT_FORM_DEFINITION;
}

export function saveFormDefinition(def: FormDefinition) {
  localStorage.setItem('form_definition', JSON.stringify(def));
}
