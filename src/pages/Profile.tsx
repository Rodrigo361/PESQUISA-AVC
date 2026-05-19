import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Shield, User } from 'lucide-react';

export function Profile() {
  const { user, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Meu Perfil</h2>
      
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 pb-6">
          <Avatar className="h-20 w-20 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">@{user.username}</span>
              <Badge variant={isAdmin ? 'default' : 'secondary'} className="ml-2">
                {isAdmin ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                {isAdmin ? 'Administrador' : 'Pesquisador'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">ID do Usuário</span>
              <p className="font-mono text-sm">{user.id}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Status da Conta</span>
              <p className="flex items-center text-success font-medium">
                <span className="w-2 h-2 rounded-full bg-success mr-2"></span>
                Ativa
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
