import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getScriptUrl, setScriptUrl, testGoogleSheetsConnection, GOOGLE_APPS_SCRIPT } from '../lib/googleSheets';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { CheckCircle2, AlertCircle, Copy, ExternalLink, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';

export function ConfigSheets() {
  const { isAdmin } = useAuth();
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAdmin) {
      setUrl(getScriptUrl());
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this should be a secure backend check.
    // For now, we allow admins to unlock it directly.
    if (isAdmin) {
      setUnlocked(true);
      toast.success('Configurações desbloqueadas.');
    } else {
      toast.error('Acesso negado.');
    }
  };

  const handleSave = async () => {
    setScriptUrl(url);
    toast.success('URL salva com sucesso!');
    await handleTest();
  };

  const handleTest = async () => {
    setStatus('testing');
    setMessage('Testando conexão com o Google Sheets...');
    
    const result = await testGoogleSheetsConnection();
    
    if (result.success) {
      setStatus('success');
      setMessage(result.message);
      toast.success(result.message);
    } else {
      setStatus('error');
      setMessage(result.message);
      toast.error(result.message);
    }
  };

  const copyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT);
    toast.success('Script copiado para a área de transferência!');
  };

  if (!unlocked) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="border-destructive/50 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-4">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Acesso Restrito</CardTitle>
            <CardDescription>
              A configuração do banco de dados em nuvem afeta todo o sistema.
              Digite a senha de segurança para continuar.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleUnlock}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="admin-password">Senha de Configuração</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Digite a senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" variant="destructive">
                <Unlock className="mr-2 h-4 w-4" />
                Desbloquear Configurações
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Integração Google Sheets</h2>
        <p className="text-muted-foreground mt-1">Configure a conexão com o banco de dados na nuvem.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status da Conexão</CardTitle>
          <CardDescription>Verifique se o sistema consegue se comunicar com a planilha.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="flex-1 space-y-2 w-full">
              <Label htmlFor="script-url">URL do Web App (Google Apps Script)</Label>
              <Input
                id="script-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="font-mono text-sm w-full"
              />
            </div>
            <Button onClick={handleSave} className="w-full sm:w-32">Salvar e Testar</Button>
          </div>

          {status !== 'idle' && (
            <Alert variant={status === 'success' ? 'default' : status === 'error' ? 'destructive' : 'default'} className={status === 'success' ? 'bg-success/10 text-success border-success/20' : ''}>
              {status === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{status === 'success' ? 'Sucesso' : status === 'error' ? 'Erro' : 'Testando...'}</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
              Passo a Passo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
              <li>Crie uma nova planilha no Google Sheets.</li>
              <li>No menu superior, vá em <strong>Extensões &gt; Apps Script</strong>.</li>
              <li>Apague o código existente e cole o script fornecido ao lado.</li>
              <li>Clique no botão azul <strong>Implantar &gt; Nova implantação</strong>.</li>
              <li>Em "Selecione o tipo", escolha <strong>App da Web</strong>.</li>
              <li>Em "Executar como", selecione <strong>Eu</strong>.</li>
              <li>Em "Quem pode acessar", selecione <strong>Qualquer pessoa</strong>.</li>
              <li>Clique em Implantar e autorize o acesso à sua conta Google.</li>
              <li>Copie a <strong>URL do app da Web</strong> gerada e cole no campo acima.</li>
            </ol>
            <Button variant="outline" className="w-full mt-4" render={<a href="https://docs.google.com/spreadsheets/create" target="_blank" rel="noopener noreferrer" />}>
                Criar Nova Planilha <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
              Código do Script
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={copyScript}>
              <Copy className="mr-2 h-4 w-4" /> Copiar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-md p-4 overflow-x-auto">
              <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all h-[250px] overflow-y-auto">
                {GOOGLE_APPS_SCRIPT}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
