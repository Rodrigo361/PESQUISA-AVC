import { PatientData, Researcher, RESEARCHERS } from './types';
import { fetchUsersFromGoogleSheets, sendUserToGoogleSheets, deleteUserFromGoogleSheets } from './googleSheets';

const PATIENTS_KEY = 'avc_patients';
const AUTH_KEY = 'avc_auth';
const RESEARCHERS_KEY = 'avc_researchers';

// Variável para evitar múltiplas sincronizações simultâneas
let isSyncingUsers = false;

export async function syncResearchersWithGoogleSheets() {
  if (isSyncingUsers) return;
  isSyncingUsers = true;
  
  try {
    const remoteUsers = await fetchUsersFromGoogleSheets();
    if (remoteUsers && remoteUsers.length > 0) {
      const localUsers = getResearchers();
      
      // Merge: remote users take precedence for new ones, but we keep local hardcoded ones if not in remote
      const merged = [...remoteUsers];
      
      // Add hardcoded ones if they don't exist remotely
      for (const r of RESEARCHERS) {
        if (!merged.find(m => m.id === r.id)) {
          merged.push(r);
          // Send to remote so it's synced
          sendUserToGoogleSheets(r);
        }
      }
      
      saveResearchers(merged);
    } else {
      // If remote is empty, send all local ones
      const localUsers = getResearchers();
      for (const r of localUsers) {
        sendUserToGoogleSheets(r);
      }
    }
  } catch (error) {
    console.error('Failed to sync users', error);
  } finally {
    isSyncingUsers = false;
  }
}

export function getResearchers(): Researcher[] {
  const stored = localStorage.getItem(RESEARCHERS_KEY);
  if (stored) {
    const parsed: Researcher[] = JSON.parse(stored);
    
    // Sync passwords from hardcoded RESEARCHERS to the stored ones
    const synced = parsed.map(p => {
      const original = RESEARCHERS.find(r => r.id === p.id);
      if (original) {
        return { ...p, password: original.password };
      }
      return p;
    });
    
    // Add any new researchers that might have been added to the hardcoded list
    RESEARCHERS.forEach(r => {
      if (!synced.find(s => s.id === r.id)) {
        synced.push(r);
      }
    });
    
    saveResearchers(synced);
    return synced;
  }
  saveResearchers(RESEARCHERS);
  return RESEARCHERS;
}

export function saveResearchers(researchers: Researcher[]): void {
  localStorage.setItem(RESEARCHERS_KEY, JSON.stringify(researchers));
}

export function login(username: string, password: string): Researcher | null {
  const researchers = getResearchers();
  const user = researchers.find(
    (r) => r.username.toLowerCase() === username.toLowerCase() && r.password === password
  );
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
  }
  return null;
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function getCurrentUser(): Researcher | null {
  const stored = localStorage.getItem(AUTH_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
}

export function getPatients(): PatientData[] {
  const stored = localStorage.getItem(PATIENTS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
}

export function savePatient(patient: PatientData): void {
  const patients = getPatients();
  const index = patients.findIndex((p) => p.id === patient.id);
  
  patient.updatedAt = new Date().toISOString();
  
  if (index >= 0) {
    patients[index] = patient;
  } else {
    patients.push(patient);
  }
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
}

export function deletePatient(id: string): void {
  const patients = getPatients();
  const filtered = patients.filter((p) => p.id !== id);
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(filtered));
}

export function getPatientsByResearcher(researcherId: string): PatientData[] {
  const patients = getPatients();
  return patients.filter((p) => p.researcherId === researcherId);
}

export function exportToCSV(patients: PatientData[]): string {
  if (patients.length === 0) return '';
  
  const flattenedPatients = patients.map(p => {
    const flat: Record<string, any> = { ...p };
    if (p.answers) {
      delete flat.answers;
      Object.entries(p.answers).forEach(([key, value]) => {
        flat[`answer_${key}`] = value;
      });
    }
    return flat;
  });

  // Get all possible headers from all patients
  const allHeaders = new Set<string>();
  flattenedPatients.forEach(p => {
    Object.keys(p).forEach(k => allHeaders.add(k));
  });
  const headersArray = Array.from(allHeaders);

  const headers = headersArray.join(',');
  const rows = flattenedPatients.map((p) => {
    return headersArray.map((header) => {
      const val = p[header];
      const str = val === undefined || val === null ? '' : String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(',');
  });
  
  return '\uFEFF' + [headers, ...rows].join('\n'); // BOM for UTF-8 Excel compatibility
}
