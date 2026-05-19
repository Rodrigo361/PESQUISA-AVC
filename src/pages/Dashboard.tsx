import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPatients, getPatientsByResearcher } from '../lib/storage';
import { isGoogleSheetsConfigured } from '../lib/googleSheets';
import { PatientData } from '../lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Cloud, CloudOff, FileText, Users, Clock, PlusCircle, Database } from 'lucide-react';
import { format } from 'date-fns';

export function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [myPatients, setMyPatients] = useState<PatientData[]>([]);
  const [allPatients, setAllPatients] = useState<PatientData[]>([]);
  const isSheetsConfigured = isGoogleSheetsConfigured();

  useEffect(() => {
    if (user) {
      setMyPatients(getPatientsByResearcher(user.id));
      if (isAdmin) {
        setAllPatients(getPatients());
      }
    }
  }, [user, isAdmin]);

  const finalizados = myPatients.filter(p => p.status === 'finalizado').length;
  const rascunhos = myPatients.filter(p => p.status === 'rascunho').length;

  const recentPatients = [...myPatients]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Olá, {user?.name}!</h2>
          <p className="text-muted-foreground mt-1">
            Bem-vindo ao sistema de coleta de dados do Estudo Epidemiológico de AVC.
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-sm font-medium bg-muted/50 px-3 py-1.5 rounded-full border">
          {isSheetsConfigured ? (
            <><Cloud className="h-4 w-4 text-primary" /> Sincronização Ativa</>
          ) : (
            <><CloudOff className="h-4 w-4 text-muted-foreground" /> Apenas Local</>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Minhas Coletas</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{myPatients.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total de pacientes registrados</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-success shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Finalizados</CardTitle>
            <FileText className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{finalizados}</div>
            <p className="text-xs text-muted-foreground mt-1">Prontos para análise</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-warning shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rascunhos</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{rascunhos}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando preenchimento</p>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className="md:col-span-3 bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-primary">Total Geral do Estudo (Admin)</CardTitle>
              <Database className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{allPatients.length}</div>
              <p className="text-xs text-primary/80 mt-1">Pacientes coletados por todos os pesquisadores</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Últimas Coletas</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Seus 10 registros mais recentes</p>
            </div>
            <Button render={<Link to="/nova-coleta" />} size="sm" className="hidden sm:flex">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Coleta
            </Button>
          </CardHeader>
          <CardContent>
            {recentPatients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                <FileText className="h-12 w-12 mb-3 opacity-20" />
                <p>Você ainda não possui coletas registradas.</p>
                <Button render={<Link to="/nova-coleta" />} variant="outline" className="mt-4 sm:hidden">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Iniciar Primeira Coleta
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPatients.map((patient) => (
                  <div key={patient.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 last:border-0 last:pb-0 gap-2">
                    <div className="space-y-1">
                      <p className="font-medium leading-none">{patient.answers?.nome_completo || 'Sem nome'}</p>
                      <p className="text-xs text-muted-foreground">
                        Matrícula: {patient.answers?.prontuario_id || '—'} • Atualizado em {format(new Date(patient.updatedAt), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        patient.status === 'finalizado' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>
                        {patient.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
                      </span>
                      <Button render={<Link to={`/nova-coleta?id=${patient.id}`} />} variant="ghost" size="sm" className="h-8 px-2">
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
