/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './components/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NewCollection } from './pages/NewCollection';
import { PatientsList } from './pages/PatientsList';
import { Database } from './pages/Database';
import { Statistics } from './pages/Statistics';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { ConfigSheets } from './pages/ConfigSheets';
import { FormEditor } from './pages/FormEditor';
import { DischargeManagement } from './pages/DischargeManagement';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/nova-coleta" element={<NewCollection />} />
            <Route path="/pacientes" element={<PatientsList />} />
            <Route path="/gestao-altas" element={<DischargeManagement />} />
            <Route path="/base-dados" element={<Database />} />
            <Route path="/estatisticas" element={<Statistics />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/config-sheets" element={<ConfigSheets />} />
            <Route path="/editor-formulario" element={<FormEditor />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
