import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPatients, getPatientsByResearcher, deletePatient } from '../lib/storage';
import { deleteFromGoogleSheets, syncWithSpreadsheet } from '../lib/googleSheets';
import { PatientData } from '../lib/types';
import { PatientCoverSheet } from '../components/PatientCoverSheet';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Eye, Pencil, Trash2, Search, PlusCircle, Filter, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function PatientsList() {
  const { user, isAdmin } = useAuth();
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadPatients();
  }, [user, isAdmin]);

  const loadPatients = () => {
    if (user) {
      if (isAdmin) {
        setPatients(getPatients());
      } else {
        setPatients(getPatientsByResearcher(user.id));
      }
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const success = await syncWithSpreadsheet();
      if (success) {
        loadPatients();
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

  const handleDelete = async (id: string) => {
    deletePatient(id);
    loadPatients();
    toast.success('Coleta excluída com sucesso.');
    await deleteFromGoogleSheets(id);
  };

  const filteredPatients = patients.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const nome = String(p.answers?.nome_completo || '');
    const matricula = String(p.answers?.prontuario_id || '');
    return (
      nome.toLowerCase().includes(searchLower) ||
      matricula.toLowerCase().includes(searchLower) ||
      (isAdmin && p.researcherName && String(p.researcherName).toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Meus Pacientes</h2>
          <p className="text-muted-foreground mt-1">Gerencie as coletas realizadas por você.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSync} disabled={isSyncing} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
          <Button render={<Link to="/nova-coleta" />}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Coleta
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome ou matrícula..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>{filteredPatients.length} resultados</span>
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
        {/* Mobile View: Cards */}
        <div className="block md:hidden">
          {filteredPatients.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum paciente encontrado.
            </div>
          ) : (
            <div className="divide-y">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="p-4 space-y-3 hover:bg-muted/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-base">{patient.answers?.nome_completo || 'Sem nome'}</div>
                      <div className="text-sm text-muted-foreground">Matrícula: {patient.answers?.prontuario_id || '—'}</div>
                    </div>
                    <Badge variant={patient.status === 'finalizado' ? 'default' : 'secondary'} 
                           className={patient.status === 'finalizado' ? 'bg-success hover:bg-success/90' : 'bg-warning hover:bg-warning/90 text-warning-foreground'}>
                      {patient.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground flex justify-between items-center">
                    <span>{format(new Date(patient.createdAt), 'dd/MM/yyyy')}</span>
                    {isAdmin && <span>{patient.researcherName}</span>}
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" onClick={() => setSelectedPatient(patient)}>
                      <Eye className="h-4 w-4 mr-1" /> Ver
                    </Button>
                    <Button variant="outline" size="sm" render={<Link to={`/nova-coleta?id=${patient.id}`} />}>
                      <Pencil className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(patient.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4 mr-1" /> Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[100px]">Matrícula</TableHead>
                <TableHead>Nome do Paciente</TableHead>
                <TableHead>Data da Coleta</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead>Pesquisador</TableHead>}
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="h-32 text-center text-muted-foreground">
                    Nenhum paciente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{patient.answers?.prontuario_id || '—'}</TableCell>
                    <TableCell className="font-semibold">{patient.answers?.nome_completo || 'Sem nome'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(patient.createdAt), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={patient.status === 'finalizado' ? 'default' : 'secondary'} 
                             className={patient.status === 'finalizado' ? 'bg-success hover:bg-success/90' : 'bg-warning hover:bg-warning/90 text-warning-foreground'}>
                        {patient.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-muted-foreground">
                        {patient.researcherName}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Ver Folha de Rosto" onClick={() => setSelectedPatient(patient)}>
                          <Eye className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Editar" render={<Link to={`/nova-coleta?id=${patient.id}`} />}>
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Excluir" onClick={() => handleDelete(patient.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
