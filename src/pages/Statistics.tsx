import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPatients } from '../lib/storage';
import { PatientData } from '../lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { resolveLabel, TIPO_AVC_MAP, SEXO_MAP, RACA_MAP, TRATAMENTO_MAP } from '../lib/labelMaps';
import { calcPortaAgulha, calcPortaTC, calcSintomasAteTratamento, calcSintomasAteTC, calcSintomasAteHospital, average, formatMinutes } from '../lib/timeCalculations';
import { Activity, Clock, HeartPulse, TrendingUp } from 'lucide-react';

const COLORS = ['#e11d48', '#0f766e', '#1e3a8a', '#d97706', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'];

export function Statistics() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientData[]>([]);

  useEffect(() => {
    setPatients(getPatients().filter(p => p.status === 'finalizado'));
  }, []);

  if (patients.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Não há dados finalizados suficientes para gerar estatísticas.</div>;
  }

  // KPIs
  const total = patients.length;
  const idades = patients.map(p => Number(p.answers?.idade)).filter(i => !isNaN(i));
  const mediaIdade = idades.length ? Math.round(idades.reduce((a, b) => a + b, 0) / idades.length) : 0;
  
  const nihss = patients.map(p => Number(p.answers?.nihss)).filter(n => !isNaN(n) && n !== 0); // Assuming 0 might be unentered or actual 0, but let's filter NaN
  const mediaNihss = nihss.length ? (nihss.reduce((a, b) => a + b, 0) / nihss.length).toFixed(1) : '—';

  const obitos = patients.filter(p => p.answers?.destino_alta === 'Óbito').length;
  const mortalidade = total ? ((obitos / total) * 100).toFixed(1) : 0;

  const trombolisados = patients.filter(p => p.answers?.tratamento_realizado === '1' || p.answers?.tratamento_realizado === '3').length;
  const taxaTrombolise = total ? ((trombolisados / total) * 100).toFixed(1) : 0;

  // Gráficos - Tipo AVC
  const tipoAvcCounts = patients.reduce((acc, p) => {
    const tipo = p.answers?.tipo_avc || 'Não Informado';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const tipoAvcData = Object.keys(tipoAvcCounts).map(k => ({ name: k, value: tipoAvcCounts[k] }));

  // Gráficos - Sexo
  const sexoCounts = patients.reduce((acc, p) => {
    const sexo = p.answers?.sexo || 'Não Informado';
    acc[sexo] = (acc[sexo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const sexoData = Object.keys(sexoCounts).map(k => ({ name: k, value: sexoCounts[k] }));

  // Gráficos - Raça
  const racaCounts = patients.reduce((acc, p) => {
    const raca = p.answers?.raca_ibge || 'Não Informado';
    acc[raca] = (acc[raca] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const racaData = Object.keys(racaCounts).map(k => ({ name: k, value: racaCounts[k] }));

  // Tempos
  const portaAgulha = average(patients.map(calcPortaAgulha));
  const portaTC = average(patients.map(calcPortaTC));
  const sintTrat = average(patients.map(calcSintomasAteTratamento));
  const sintTC = average(patients.map(calcSintomasAteTC));
  const sintHosp = average(patients.map(calcSintomasAteHospital));

  const tempoData = [
    { name: 'Porta-Agulha', minutos: portaAgulha },
    { name: 'Porta-TC', minutos: portaTC },
    { name: 'Sintomas → Hosp', minutos: sintHosp },
    { name: 'Sintomas → TC', minutos: sintTC },
    { name: 'Sintomas → Trat', minutos: sintTrat },
  ].filter(d => d.minutos > 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Estatísticas do Estudo</h2>
        <p className="text-muted-foreground mt-1">Análise descritiva dos dados coletados e finalizados.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Finalizados</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Média de Idade</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaIdade} anos</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">NIHSS Médio</CardTitle>
            <HeartPulse className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaNihss}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mortalidade</CardTitle>
            <Activity className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mortalidade}%</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa Trombólise</CardTitle>
            <Activity className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taxaTrombolise}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="perfil" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="perfil" className="data-[state=active]:bg-background">Perfil Epidemiológico</TabsTrigger>
          <TabsTrigger value="tempos" className="data-[state=active]:bg-background">Análise Temporal</TabsTrigger>
        </TabsList>
        
        <TabsContent value="perfil" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Tipo de AVC</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={tipoAvcData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label>
                        {tipoAvcData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Distribuição por Sexo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sexoData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label>
                        {sexoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle>Raça / Cor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={racaData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tempos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Médias de Tempo (Minutos)</CardTitle>
              <CardDescription>Intervalos médios entre os principais marcos do atendimento.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tempoData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [formatMinutes(value), 'Tempo Médio']} />
                    <Bar dataKey="minutos" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]}>
                      {tempoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
