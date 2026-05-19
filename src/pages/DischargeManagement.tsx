import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPatients, savePatient } from '../lib/storage';
import { PatientData } from '../lib/types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Search, ClipboardCheck, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export function DischargeManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Todos podem ver todos os pacientes para dar alta
    setPatients(getPatients());
  }, []);

  const filteredPatients = patients.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const nome = String(p.answers?.nome_completo || '');
    const matricula = String(p.answers?.prontuario_id || '');
    return (
      nome.toLowerCase().includes(searchLower) ||
      matricula.toLowerCase().includes(searchLower)
    );
  });

  const pendingDischarge = filteredPatients.filter(p => !p.answers?.desfecho_tipo);
  const completedDischarge = filteredPatients.filter(p => !!p.answers?.desfecho_tipo);

  const handleEditDischarge = (patientId: string) => {
    // Navigate to the form, but we can pass a query param to open the discharge tab directly
    navigate(`/nova-coleta?id=${patientId}&tab=bloco7`);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ClipboardCheck className="h-8 w-8 text-primary" />
          Gestão de Altas
        </h2>
        <p className="text-muted-foreground mt-1">Gerencie o desfecho clínico e a alta dos pacientes.</p>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome ou matrícula..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="pending">Aguardando Alta ({pendingDischarge.length})</TabsTrigger>
          <TabsTrigger value="completed">Altas Realizadas ({completedDischarge.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-4">
          <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
            {/* Mobile View */}
            <div className="block md:hidden">
              {pendingDischarge.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhum paciente aguardando alta.
                </div>
              ) : (
                <div className="divide-y">
                  {pendingDischarge.map((patient) => (
                    <div key={patient.id} className="p-4 space-y-3 hover:bg-muted/30 transition-colors">
                      <div>
                        <div className="font-semibold text-base">{patient.answers?.nome_completo || '—'}</div>
                        <div className="text-sm text-muted-foreground">Matrícula: {patient.answers?.prontuario_id || '—'}</div>
                      </div>
                      <div className="text-xs text-muted-foreground flex justify-between">
                        <span>Entrada: {patient.answers?.data_nascimento || '—'}</span>
                        <span>{patient.researcherName}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <Button size="sm" className="w-full" onClick={() => handleEditDischarge(patient.id)}>
                          Registrar Alta <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Data de Entrada</TableHead>
                    <TableHead>Pesquisador</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingDischarge.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        Nenhum paciente aguardando alta.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingDischarge.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.answers?.prontuario_id || '—'}</TableCell>
                        <TableCell className="font-semibold">{patient.answers?.nome_completo || '—'}</TableCell>
                        <TableCell>{patient.answers?.data_nascimento || '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{patient.researcherName}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => handleEditDischarge(patient.id)}>
                            Registrar Alta <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
            {/* Mobile View */}
            <div className="block md:hidden">
              {completedDischarge.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhuma alta registrada.
                </div>
              ) : (
                <div className="divide-y">
                  {completedDischarge.map((patient) => (
                    <div key={patient.id} className="p-4 space-y-3 hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-base">{patient.answers?.nome_completo || '—'}</div>
                          <div className="text-sm text-muted-foreground">Matrícula: {patient.answers?.prontuario_id || '—'}</div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {patient.answers?.desfecho_tipo === '1' ? 
                            (patient.answers?.destino_alta === '1' ? 'Alta (Domicílio)' : 
                             patient.answers?.destino_alta === '2' ? 'Alta (Transferência)' : 'Alta') : 
                           patient.answers?.desfecho_tipo === '2' ? 'Óbito' : '—'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Data: {patient.answers?.desfecho_tipo === '1' ? (patient.answers?.data_alta || '—') : (patient.answers?.data_hora_obito || '—')}
                      </div>
                      <div className="pt-2 border-t">
                        <Button variant="outline" size="sm" className="w-full" onClick={() => handleEditDischarge(patient.id)}>
                          Editar Alta
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Data da Alta</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedDischarge.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        Nenhuma alta registrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    completedDischarge.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.answers?.prontuario_id || '—'}</TableCell>
                        <TableCell className="font-semibold">{patient.answers?.nome_completo || '—'}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {patient.answers?.desfecho_tipo === '1' ? 
                              (patient.answers?.destino_alta === '1' ? 'Alta (Domicílio)' : 
                               patient.answers?.destino_alta === '2' ? 'Alta (Transferência)' : 'Alta') : 
                             patient.answers?.desfecho_tipo === '2' ? 'Óbito' : '—'}
                          </span>
                        </TableCell>
                        <TableCell>{patient.answers?.desfecho_tipo === '1' ? (patient.answers?.data_alta || '—') : (patient.answers?.data_hora_obito || '—')}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleEditDischarge(patient.id)}>
                            Editar Alta
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
