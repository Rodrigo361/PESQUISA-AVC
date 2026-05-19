import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPatients } from '../lib/storage';
import { syncWithSpreadsheet } from '../lib/googleSheets';
import { PatientData } from '../lib/types';
import { PatientCoverSheet } from '../components/PatientCoverSheet';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Eye, ExternalLink, Search, Database as DatabaseIcon, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function Database() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setPatients(getPatients());
  }, []);

  const handleOpenSpreadsheet = () => {
    window.open('https://docs.google.com/spreadsheets/d/13lgQ_8iGml5LG_TvoiHf8WrgfXN_oLt6FD8PvZyBFP4/edit?gid=1008118212#gid=1008118212', '_blank');
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const success = await syncWithSpreadsheet();
      if (success) {
        setPatients(getPatients());
        toast.success('Dados sincronizados com sucesso!');
      } else {
        toast.error('Erro ao sincronizar dados. Verifique a URL da planilha.');
      }
    } catch (error) {
      toast.error('Erro ao sincronizar dados.');
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const nome = String(p.answers?.nome_completo || '');
    const matricula = String(p.answers?.prontuario_id || '');
    return (
      nome.toLowerCase().includes(searchLower) ||
      matricula.toLowerCase().includes(searchLower) ||
      (p.researcherName && String(p.researcherName).toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <DatabaseIcon className="h-8 w-8 text-primary" />
            Base de Dados Completa
          </h2>
          <p className="text-muted-foreground mt-1">Visualize todos os dados coletados no estudo.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSync} disabled={isSyncing} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
          <Button onClick={handleOpenSpreadsheet} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
            <ExternalLink className="mr-2 h-4 w-4" />
            Abrir Planilha
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome, matrícula ou pesquisador..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground font-medium w-full sm:w-auto text-center sm:text-left">
          {filteredPatients.length} registros encontrados
        </div>
      </div>

      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[2000px]">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="sticky left-0 z-20 bg-muted/95 backdrop-blur w-[80px] text-center border-r">Ações</TableHead>
                <TableHead className="w-[120px]">Matrícula</TableHead>
                <TableHead className="w-[250px]">Nome</TableHead>
                <TableHead className="w-[100px]">Idade</TableHead>
                <TableHead className="w-[120px]">Sexo</TableHead>
                <TableHead className="w-[150px]">Raça</TableHead>
                <TableHead className="w-[200px]">Escolaridade</TableHead>
                <TableHead className="w-[200px]">Município</TableHead>
                <TableHead className="w-[150px]">Data AVC</TableHead>
                <TableHead className="w-[200px]">Tipo AVC</TableHead>
                <TableHead className="w-[150px]">NIHSS</TableHead>
                <TableHead className="w-[150px]">Rankin Adm.</TableHead>
                <TableHead className="w-[200px]">Pesquisador</TableHead>
                <TableHead className="w-[150px]">Status</TableHead>
                <TableHead className="w-[150px]">Data Registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={15} className="h-32 text-center text-muted-foreground">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="sticky left-0 z-10 bg-card border-r text-center">
                      <Button variant="ghost" size="icon" title="Ver Folha de Rosto" onClick={() => setSelectedPatient(patient)}>
                        <Eye className="h-4 w-4 text-primary" />
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{patient.answers?.prontuario_id || '—'}</TableCell>
                    <TableCell className="font-semibold truncate max-w-[250px]" title={patient.answers?.nome_completo}>{patient.answers?.nome_completo || '—'}</TableCell>
                    <TableCell>{patient.answers?.idade || '—'}</TableCell>
                    <TableCell>{patient.answers?.sexo || '—'}</TableCell>
                    <TableCell>{patient.answers?.raca_ibge || '—'}</TableCell>
                    <TableCell className="truncate max-w-[200px]" title={patient.answers?.escolaridade}>
                      {patient.answers?.escolaridade || '—'}
                    </TableCell>
                    <TableCell className="truncate max-w-[200px]" title={patient.answers?.municipio}>{patient.answers?.municipio || '—'}</TableCell>
                    <TableCell>{patient.answers?.data_nascimento || '—'}</TableCell>
                    <TableCell className="truncate max-w-[200px]" title={patient.answers?.tipo_avc}>
                      {patient.answers?.tipo_avc || '—'}
                    </TableCell>
                    <TableCell>{patient.answers?.nihss !== undefined ? patient.answers.nihss : '—'}</TableCell>
                    <TableCell>{patient.answers?.rankin_previo !== undefined ? patient.answers.rankin_previo : '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{patient.researcherName}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        patient.status === 'finalizado' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>
                        {patient.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(patient.createdAt), 'dd/MM/yyyy')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedPatient && (
        <PatientCoverSheet patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
      )}
    </div>
  );
}
