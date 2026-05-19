import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getResearchers, saveResearchers, getPatientsByResearcher } from '../lib/storage';
import { sendUserToGoogleSheets, deleteUserFromGoogleSheets } from '../lib/googleSheets';
import { Researcher } from '../lib/types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Shield, ShieldAlert, User, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

export function Admin() {
  const { user, isAdmin } = useAuth();
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [open, setOpen] = useState(false);
  const [newRes, setNewRes] = useState({ name: '', username: '', password: '', isAdmin: false });

  useEffect(() => {
    if (isAdmin) {
      setResearchers(getResearchers());
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const isSuperAdmin = user?.username === 'rodrigo' || user?.username === 'herminia';

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRes.name || !newRes.username || !newRes.password) {
      toast.error('Preencha todos os campos.');
      return;
    }
    
    const exists = researchers.find(r => r.username.toLowerCase() === newRes.username.toLowerCase());
    if (exists) {
      toast.error('Nome de usuário já existe.');
      return;
    }

    const newResearcher: Researcher = {
      id: Date.now().toString(),
      ...newRes
    };

    const updated = [...researchers, newResearcher];
    setResearchers(updated);
    saveResearchers(updated);
    sendUserToGoogleSheets(newResearcher);
    setOpen(false);
    setNewRes({ name: '', username: '', password: '', isAdmin: false });
    toast.success('Pesquisador adicionado com sucesso!');
  };

  const handleDelete = (id: string) => {
    if (id === user?.id) {
      toast.error('Você não pode excluir a si mesmo.');
      return;
    }
    const updated = researchers.filter(r => r.id !== id);
    setResearchers(updated);
    saveResearchers(updated);
    deleteUserFromGoogleSheets(id);
    toast.success('Pesquisador removido.');
  };

  const toggleAdmin = (id: string) => {
    if (!isSuperAdmin) {
      toast.error('Apenas Super Admins podem alterar permissões.');
      return;
    }
    if (id === user?.id) {
      toast.error('Você não pode alterar sua própria permissão.');
      return;
    }
    
    let updatedUser: Researcher | undefined;
    const updated = researchers.map(r => {
      if (r.id === id) {
        updatedUser = { ...r, isAdmin: !r.isAdmin };
        return updatedUser;
      }
      return r;
    });
    setResearchers(updated);
    saveResearchers(updated);
    if (updatedUser) {
      sendUserToGoogleSheets(updatedUser);
    }
    toast.success('Permissões atualizadas.');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Administração</h2>
          <p className="text-muted-foreground mt-1">Gerencie os pesquisadores e acessos do sistema.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            Novo Pesquisador
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Pesquisador</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" value={newRes.name} onChange={e => setNewRes({...newRes, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input id="username" value={newRes.username} onChange={e => setNewRes({...newRes, username: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="text" value={newRes.password} onChange={e => setNewRes({...newRes, password: e.target.value})} required />
              </div>
              {isSuperAdmin && (
                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="is-admin" checked={newRes.isAdmin} onCheckedChange={c => setNewRes({...newRes, isAdmin: c})} />
                  <Label htmlFor="is-admin">Privilégios de Administrador</Label>
                </div>
              )}
              <Button type="submit" className="w-full mt-4">Salvar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        {/* Mobile View */}
        <div className="block md:hidden divide-y">
          {researchers.map((r) => {
            const coletas = getPatientsByResearcher(r.id).length;
            const isSuper = r.username === 'rodrigo' || r.username === 'herminia';
            
            return (
              <div key={r.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-base">{r.name}</div>
                    <div className="text-sm text-muted-foreground">@{r.username}</div>
                  </div>
                  <Badge variant={r.isAdmin ? (isSuper ? 'destructive' : 'default') : 'secondary'}>
                    {isSuper ? <ShieldAlert className="w-3 h-3 mr-1" /> : (r.isAdmin ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />)}
                    {isSuper ? 'Super Admin' : (r.isAdmin ? 'Admin' : 'Pesquisador')}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Senha: </span>
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{r.password}</code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Coletas: </span>
                    <span className="font-medium">{coletas}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  {isSuperAdmin && !isSuper && r.id !== user?.id && (
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => toggleAdmin(r.id)}>
                      {r.isAdmin ? 'Rebaixar' : 'Promover'}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => window.location.href = `/base-dados?researcher=${r.id}`}>
                    <Eye className="h-4 w-4 mr-2" /> Ver Coletas
                  </Button>
                  {!isSuper && r.id !== user?.id && (
                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(r.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Senha</TableHead>
                <TableHead>Função</TableHead>
                <TableHead className="text-center">Coletas</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {researchers.map((r) => {
                const coletas = getPatientsByResearcher(r.id).length;
                const isSuper = r.username === 'rodrigo' || r.username === 'herminia';
                
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.username}</TableCell>
                    <TableCell><code className="bg-muted px-2 py-1 rounded text-xs">{r.password}</code></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={r.isAdmin ? (isSuper ? 'destructive' : 'default') : 'secondary'}>
                          {isSuper ? <ShieldAlert className="w-3 h-3 mr-1" /> : (r.isAdmin ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />)}
                          {isSuper ? 'Super Admin' : (r.isAdmin ? 'Admin' : 'Pesquisador')}
                        </Badge>
                        {isSuperAdmin && !isSuper && r.id !== user?.id && (
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => toggleAdmin(r.id)}>
                            {r.isAdmin ? 'Rebaixar' : 'Promover'}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{coletas}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Ver Coletas" onClick={() => window.location.href = `/base-dados?researcher=${r.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!isSuper && r.id !== user?.id && (
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(r.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
