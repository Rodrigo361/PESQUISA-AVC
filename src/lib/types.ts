export interface Researcher {
  id: string;
  name: string;
  username: string;
  password: string;
  isAdmin: boolean;
  role?: 'admin' | 'pesquisador' | 'monitor_desfecho';
}

export const RESEARCHERS: Researcher[] = [
  { id: '1', name: 'Amanda', username: 'amanda', password: 'Amanda@avc1', isAdmin: false, role: 'pesquisador' },
  { id: '2', name: 'Ana Darphny', username: 'anadarphny', password: 'AnaDarphny@avc2', isAdmin: false, role: 'pesquisador' },
  { id: '3', name: 'Anne Caroline', username: 'annecaroline', password: 'AnneCaroline@avc3', isAdmin: false, role: 'pesquisador' },
  { id: '4', name: 'Beatriz', username: 'beatriz', password: 'Beatriz@avc4', isAdmin: false, role: 'pesquisador' },
  { id: '5', name: 'Eduardo', username: 'eduardo', password: 'Eduardo@avc5', isAdmin: false, role: 'pesquisador' },
  { id: '6', name: 'Rodrigo', username: 'rodrigo', password: 'Rodrigo@avc3', isAdmin: true, role: 'admin' },
  { id: '7', name: 'Marcio', username: 'marcio', password: 'Marcio@avc7', isAdmin: false, role: 'pesquisador' },
  { id: '8', name: 'Cleuson', username: 'cleuson', password: 'Cleuson@avc8', isAdmin: false, role: 'pesquisador' },
  { id: '9', name: 'Vanessa', username: 'vanessa', password: 'Vanessa@avc9', isAdmin: false, role: 'pesquisador' },
  { id: '10', name: 'Emille', username: 'emille', password: 'Emille@avc10', isAdmin: false, role: 'pesquisador' },
  { id: '11', name: 'Helaine', username: 'helaine', password: 'Helaine@avc11', isAdmin: false, role: 'pesquisador' },
  { id: '12', name: 'Amalia', username: 'amalia', password: 'Amalia@avc12', isAdmin: false, role: 'pesquisador' },
  { id: '13', name: 'Nayada', username: 'nayada', password: 'Nayada@avc13', isAdmin: false, role: 'pesquisador' },
  { id: '14', name: 'Yllan', username: 'yllan', password: 'Yllan@admin14', isAdmin: true, role: 'admin' },
  { id: '15', name: 'Hermínia', username: 'herminia', password: 'Herminia@admin15', isAdmin: true, role: 'admin' },
  { id: '16', name: 'Monitor Alta', username: 'monitor', password: 'Monitor@alta1', isAdmin: false, role: 'monitor_desfecho' },
];

export interface PatientData {
  id: string;
  researcherId: string;
  researcherName: string;
  status: 'rascunho' | 'finalizado';
  createdAt: string;
  updatedAt: string;
  currentBlock: number;
  
  // Dynamic answers based on form definition
  answers: Record<string, any>;

  // Post-finalization data
  dataAlta?: string;
  destinoAlta?: string;
  localTransferencia?: string;
  tempoInternacao?: number;
}
