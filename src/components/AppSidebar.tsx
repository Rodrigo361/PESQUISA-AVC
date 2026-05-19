import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from './ui/sidebar';
import {
  LayoutDashboard,
  FilePlus2,
  Users,
  Database,
  BarChart3,
  UserCircle,
  Settings,
  ShieldAlert,
  LogOut,
  Activity,
  ClipboardCheck
} from 'lucide-react';
import { Button } from './ui/button';

export function AppSidebar() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const getRoleDisplay = () => {
    if (isAdmin) return 'Administrador';
    if (user?.role === 'monitor_desfecho') return 'Monitor de Desfecho';
    return 'Pesquisador';
  };

  return (
    <Sidebar className="no-print border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <Activity className="h-6 w-6" />
          <span className="">AVC Sobral</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link to="/" />} isActive={isActive('/')}>
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {user?.role !== 'monitor_desfecho' && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton render={<Link to="/nova-coleta" />} isActive={isActive('/nova-coleta')}>
                      <FilePlus2 />
                      <span>Nova Coleta</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton render={<Link to="/pacientes" />} isActive={isActive('/pacientes')}>
                      <Users />
                      <span>Meus Pacientes</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link to="/gestao-altas" />} isActive={isActive('/gestao-altas')}>
                  <ClipboardCheck />
                  <span>Gestão de Altas</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link to="/base-dados" />} isActive={isActive('/base-dados')}>
                  <Database />
                  <span>Base de Dados</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link to="/estatisticas" />} isActive={isActive('/estatisticas')}>
                  <BarChart3 />
                  <span>Estatísticas</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link to="/perfil" />} isActive={isActive('/perfil')}>
                  <UserCircle />
                  <span>Perfil</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link to="/admin" />} isActive={isActive('/admin')}>
                    <ShieldAlert />
                    <span>Pesquisadores</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link to="/config-sheets" />} isActive={isActive('/config-sheets')}>
                    <Settings />
                    <span>Google Sheets</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link to="/editor-formulario" />} isActive={isActive('/editor-formulario')}>
                    <FilePlus2 />
                    <span>Editor de Formulário</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.name}</span>
            <span className="text-xs text-muted-foreground">
              {getRoleDisplay()}
            </span>
          </div>
          <Button variant="outline" className="w-full justify-start" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
