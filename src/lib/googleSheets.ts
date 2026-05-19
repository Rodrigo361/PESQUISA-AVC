import { PatientData } from './types';
import { getFormDefinition } from './formDefinition';
import { getPatients } from './storage';

const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzykZRtHdk3kOLHosPYnLNi2gAeWf-XtOV5LlPlJuJ_UzH5hRRgfRg2ZZDhjho1Xv9hRA/exec';
const SCRIPT_URL_KEY = 'avc_google_sheets_url';
const CACHE_KEY = 'avc_sheets_cache';
const CACHE_TIME_KEY = 'avc_sheets_cache_time';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export function getScriptUrl(): string {
  let url = localStorage.getItem(SCRIPT_URL_KEY) || DEFAULT_SCRIPT_URL;
  if (url && !url.endsWith('/exec')) {
    // If it ends with /edit or something else, replace it
    if (url.includes('/edit')) {
      url = url.split('/edit')[0] + '/exec';
    } else if (!url.endsWith('/')) {
      url = url + '/exec';
    } else {
      url = url + 'exec';
    }
  }
  return url;
}

export function setScriptUrl(url: string): void {
  localStorage.setItem(SCRIPT_URL_KEY, url);
}

export function isGoogleSheetsConfigured(): boolean {
  return !!getScriptUrl();
}

export async function deleteFromGoogleSheets(id: string): Promise<boolean> {
  const url = getScriptUrl();
  if (!url) return false;

  try {
    const payload = {
      id: id,
      action: 'delete'
    };
    
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload)
    });
    
    clearSheetsCache();
    return true;
  } catch (error) {
    console.error('Error deleting from Google Sheets:', error);
    return false;
  }
}

export async function sendUserToGoogleSheets(user: any): Promise<boolean> {
  const url = getScriptUrl();
  if (!url) return false;

  try {
    const payload = {
      action: 'insert_user',
      user: user
    };
    
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload)
    });
    
    return true;
  } catch (error) {
    console.error('Error sending user to Google Sheets:', error);
    return false;
  }
}

export async function deleteUserFromGoogleSheets(id: string): Promise<boolean> {
  const url = getScriptUrl();
  if (!url) return false;

  try {
    const payload = {
      action: 'delete_user',
      id: id
    };
    
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload)
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting user from Google Sheets:', error);
    return false;
  }
}

export async function fetchUsersFromGoogleSheets(): Promise<any[]> {
  const url = getScriptUrl();
  if (!url) return [];

  return new Promise((resolve) => {
    const callbackName = 'jsonpCallbackUsers_' + Math.round(100000 * Math.random());
    
    const timeoutId = setTimeout(() => {
      delete (window as any)[callbackName];
      resolve([]);
    }, 10000);

    (window as any)[callbackName] = (data: any) => {
      clearTimeout(timeoutId);
      delete (window as any)[callbackName];
      
      if (data && data.status === 'ok' && data.data && data.data.length > 1) {
        const headers = data.data[0];
        const users = [];
        
        for (let i = 1; i < data.data.length; i++) {
          const row = data.data[i];
          const user: any = {};
          for (let j = 0; j < headers.length; j++) {
            user[headers[j]] = row[j];
          }
          // Convert boolean strings back to boolean if needed
          if (user.isAdmin === 'true' || user.isAdmin === true) user.isAdmin = true;
          else if (user.isAdmin === 'false' || user.isAdmin === false) user.isAdmin = false;
          
          users.push(user);
        }
        resolve(users);
      } else {
        resolve([]);
      }
    };

    const script = document.createElement('script');
    script.src = `${url}?action=read_users&callback=${callbackName}`;
    script.onerror = () => {
      clearTimeout(timeoutId);
      delete (window as any)[callbackName];
      resolve([]);
    };
    document.body.appendChild(script);
  });
}

export async function sendToGoogleSheets(patient: PatientData): Promise<boolean> {
  const url = getScriptUrl();
  if (!url) return false;

  try {
    const formDef = getFormDefinition();
    const getLabel = (fieldId: string, value: any) => {
      if (!value) return value;
      for (const block of formDef.blocks) {
        const field = block.fields.find(f => f.id === fieldId);
        if (field) {
          if (field.type === 'multiselect' && Array.isArray(value)) {
            return value.map((v: string) => {
              const option = field.options?.find(o => o.value === v);
              return option ? option.label : v;
            }).join(', ');
          }
          if (field.type === 'select') {
            const option = field.options?.find(o => o.value === value);
            return option ? option.label : value;
          }
          return value;
        }
      }
      return value;
    };

    const flatPatient: Record<string, any> = {};
    
    // 1. Metadata
    flatPatient['id'] = patient.id;
    flatPatient['createdAt'] = patient.createdAt;
    flatPatient['updatedAt'] = patient.updatedAt;
    flatPatient['status'] = patient.status;
    flatPatient['researcherId'] = patient.researcherId;
    flatPatient['researcherName'] = patient.researcherName;
    flatPatient['currentBlock'] = patient.currentBlock;

    // 2. Form Answers in order
    formDef.blocks.forEach(block => {
      block.fields.forEach(field => {
        const val = patient.answers?.[field.id];
        // Use the field label and ID as the column header: "Label (id)"
        const headerName = field.label ? `${field.label} (${field.id})` : field.id;
        flatPatient[headerName] = getLabel(field.id, val) || '';
      });
    });

    // 3. Any remaining answers
    if (patient.answers) {
      Object.entries(patient.answers).forEach(([key, value]) => {
        // Check if this key was already added (by checking if any field had this id)
        const fieldExists = formDef.blocks.some(b => b.fields.some(f => f.id === key));
        if (!fieldExists) {
          flatPatient[key] = getLabel(key, value) || '';
        }
      });
    }

    const headers = Object.keys(flatPatient);
    const row = Object.values(flatPatient);
    const payload = {
      id: patient.id,
      action: 'insert',
      headers: headers,
      row: row
    };
    
    // Use POST with text/plain and no-cors to bypass CORS preflight and URL length limits
    // This is a "fire and forget" approach, which is very fast.
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload)
    });
    
    // In no-cors mode, we can't read the response properly, but if it didn't throw a network error, we assume success
    clearSheetsCache();
    return true;
  } catch (error) {
    console.error('Error sending to Google Sheets:', error);
    return false;
  }
}

export async function syncWithSpreadsheet(): Promise<boolean> {
  try {
    const sheetPatients = await fetchFromGoogleSheets(true);
    if (!sheetPatients) return false; // Only fail if it's null/undefined (error case)

    const localPatients = getPatients();
    const drafts = localPatients.filter(p => p.status === 'rascunho');
    
    // Replace all finalized patients with the ones from the spreadsheet
    const newPatients = [...drafts, ...sheetPatients];
    
    localStorage.setItem('avc_patients', JSON.stringify(newPatients));
    return true;
  } catch (error) {
    console.error("Sync error", error);
    return false;
  }
}

export async function fetchFromGoogleSheets(force: boolean = false): Promise<PatientData[] | null> {
  const url = getScriptUrl();
  if (!url) return null;

  if (!force) {
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
    const cachedData = localStorage.getItem(CACHE_KEY);
    
    if (cachedTime && cachedData) {
      const now = new Date().getTime();
      if (now - parseInt(cachedTime, 10) < CACHE_DURATION_MS) {
        try {
          return JSON.parse(cachedData);
        } catch (e) {
          // invalid cache
        }
      }
    }
  }

  return new Promise((resolve) => {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    
    (window as any)[callbackName] = function(responseData: any) {
      delete (window as any)[callbackName];
      document.body.removeChild(script);
      
      if (responseData && responseData.status === 'ok' && Array.isArray(responseData.data)) {
        const rows = responseData.data;
        if (rows.length <= 1) {
          resolve([]);
          return;
        }
        
        const headers = rows[0];
        const result = [];
        
        // Create a reverse map from label to field ID
        const labelToIdMap: Record<string, string> = {};
        const formDef = getFormDefinition();
        formDef.blocks.forEach(block => {
          block.fields.forEach(field => {
            if (field.label) {
              labelToIdMap[field.label] = field.id;
            }
          });
        });
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const obj: any = { answers: {} };
          
          for (let j = 0; j < headers.length; j++) {
            const header = headers[j];
            
            // Extract ID from "Label (id)" format
            const match = header.match(/\(([^)]+)\)$/);
            const extractedId = match ? match[1] : null;

            if (header.startsWith('answer_')) {
              obj.answers[header.replace('answer_', '')] = row[j];
            } else if (extractedId) {
              // It has an extracted ID, use it
              obj.answers[extractedId] = row[j];
            } else if (labelToIdMap[header]) {
              // Fallback to label mapping for older data
              obj.answers[labelToIdMap[header]] = row[j];
            } else if (['id', 'createdAt', 'updatedAt', 'status', 'researcherId', 'researcherName', 'currentBlock'].includes(header)) {
              // It's a known metadata field
              obj[header] = row[j];
            } else {
              // It's an unknown field or an answer without a label that used its ID as header
              obj.answers[header] = row[j];
            }
          }
          
          result.push(obj);
        }
        
        localStorage.setItem(CACHE_KEY, JSON.stringify(result));
        localStorage.setItem(CACHE_TIME_KEY, new Date().getTime().toString());
        resolve(result);
      } else if (responseData && Array.isArray(responseData)) {
        // Fallback for older script version that returned array directly
        const unflattenedData = responseData.map((row: any) => {
          if (typeof row === 'object' && row !== null) {
            const obj: any = { answers: {} };
            for (const key in row) {
              if (key.startsWith('answer_')) {
                obj.answers[key.replace('answer_', '')] = row[key];
              } else {
                obj[key] = row[key];
              }
            }
            return obj;
          }
          return row;
        });
        localStorage.setItem(CACHE_KEY, JSON.stringify(unflattenedData));
        localStorage.setItem(CACHE_TIME_KEY, new Date().getTime().toString());
        resolve(unflattenedData);
      } else {
        resolve([]);
      }
    };

    const script = document.createElement('script');
    script.src = `${url}?action=read&callback=${callbackName}`;
    script.onerror = () => {
      delete (window as any)[callbackName];
      document.body.removeChild(script);
      console.error('Error fetching from Google Sheets via JSONP');
      resolve(null);
    };
    document.body.appendChild(script);
  });
}

export async function testGoogleSheetsConnection(): Promise<{success: boolean, message: string}> {
  const url = getScriptUrl();
  if (!url) return { success: false, message: 'URL não configurada' };

  return new Promise((resolve) => {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    
    (window as any)[callbackName] = function(data: any) {
      delete (window as any)[callbackName];
      document.body.removeChild(script);
      
      if (data && data.status === 'ok') {
        resolve({ success: true, message: 'Conexão estabelecida com sucesso!' });
      } else if (Array.isArray(data)) {
        resolve({ success: true, message: 'Conexão estabelecida com sucesso!' });
      } else {
        resolve({ success: false, message: data?.message || 'Erro ao conectar. Resposta inválida.' });
      }
    };

    const script = document.createElement('script');
    script.src = `${url}?action=read&callback=${callbackName}`;
    script.onerror = () => {
      delete (window as any)[callbackName];
      document.body.removeChild(script);
      console.error('Test connection error via JSONP');
      resolve({ success: false, message: 'Erro de rede. Verifique se a URL está correta e o Web App está publicado para "Qualquer pessoa".' });
    };
    document.body.appendChild(script);
  });
}

export function clearSheetsCache(): void {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIME_KEY);
}

export const GOOGLE_APPS_SCRIPT = `
// Código para o Google Apps Script
// 1. Crie uma planilha no Google Sheets
// 2. Vá em Extensões > Apps Script
// 3. Cole este código (substituindo tudo que estiver lá)
// 4. Clique em Implantar > Nova implantação
// 5. Tipo: App da Web
// 6. IMPORTANTE - Executar como: "Eu" (sua conta)
// 7. IMPORTANTE - Quem tem acesso: "Qualquer pessoa"
// 8. Clique em Implantar, autorize os acessos e copie a URL gerada

// Substitua pelo ID da sua planilha se necessário
var SHEET_ID = '13lgQ_8iGml5LG_TvoiHf8WrgfXN_oLt6FD8PvZyBFP4';

function processRequest(e, isPost) {
  var action = e && e.parameter && e.parameter.action;
  
  var payloadStr = e && e.parameter && e.parameter.payload;
  if (!payloadStr && e && e.postData && e.postData.contents) {
    payloadStr = e.postData.contents;
  }
  
  var payload = null;
  if (payloadStr) {
    try {
      payload = JSON.parse(payloadStr);
      action = payload.action || action;
    } catch (err) {
      // ignore parse error here
    }
  }
  
  action = action || (isPost ? 'insert' : 'read');

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('Dados');
  if (!sheet) {
    sheet = ss.insertSheet('Dados');
  }

  if (action === 'read') {
    var data = sheet.getDataRange().getValues();
    return { status: 'ok', data: data };
  } else if (action === 'insert') {
    if (!payload) throw new Error('Payload invalido ou nao informado');
    
    var lastRow = sheet.getLastRow();
    
    if (lastRow === 0 && payload.headers) {
      sheet.appendRow(payload.headers);
      lastRow = 1;
    }
    
    var incomingData = {};
    for (var k = 0; k < payload.headers.length; k++) {
      incomingData[payload.headers[k]] = payload.row[k];
    }
    
    var sheetHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var headersUpdated = false;
    
    for (var k = 0; k < payload.headers.length; k++) {
      var h = payload.headers[k];
      if (sheetHeaders.indexOf(h) === -1) {
        sheetHeaders.push(h);
        headersUpdated = true;
      }
    }
    
    if (headersUpdated) {
      sheet.getRange(1, 1, 1, sheetHeaders.length).setValues([sheetHeaders]);
    }
    
    var cleanRow = [];
    for (var i = 0; i < sheetHeaders.length; i++) {
      var header = sheetHeaders[i];
      var v = incomingData[header];
      cleanRow.push(v === undefined || v === null ? '' : v);
    }
    
    var found = false;
    if (lastRow > 1) {
      var idColIndex = sheetHeaders.indexOf('id') + 1;
      
      if (idColIndex > 0) {
        var dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
        for (var j = 0; j < dataRange.length; j++) {
          var rowId = String(dataRange[j][idColIndex - 1]);
          
          var matchId = payload.id !== undefined && rowId === String(payload.id);
          
          if (matchId) {
            var existingRow = dataRange[j];
            for (var c = 0; c < cleanRow.length; c++) {
              if (cleanRow[c] === '' && existingRow[c] !== '' && existingRow[c] !== undefined) {
                cleanRow[c] = existingRow[c];
              }
            }
            
            sheet.getRange(j + 2, 1, 1, cleanRow.length).setValues([cleanRow]);
            found = true;
            break;
          }
        }
      }
    }
    
    if (!found) {
      sheet.appendRow(cleanRow);
    }
    return { status: 'ok' };
  } else if (action === 'delete') {
    if (!payload) throw new Error('Payload invalido ou nao informado');
    var lastRow = sheet.getLastRow();
    if (lastRow > 1 && payload.id !== undefined) {
      var sheetHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var idColIndex = sheetHeaders.indexOf('id') + 1;
      if (idColIndex > 0) {
        var idColValues = sheet.getRange(2, idColIndex, lastRow - 1, 1).getValues();
        for (var j = 0; j < idColValues.length; j++) {
          if (String(idColValues[j][0]) === String(payload.id)) {
            sheet.deleteRow(j + 2);
            break;
          }
        }
      }
    }
    return { status: 'ok' };
  } else if (action === 'read_users') {
    var usersSheet = ss.getSheetByName('Usuarios');
    if (!usersSheet) {
      usersSheet = ss.insertSheet('Usuarios');
      usersSheet.appendRow(['id', 'name', 'username', 'password', 'isAdmin', 'role']);
    }
    var data = usersSheet.getDataRange().getValues();
    return { status: 'ok', data: data };
  } else if (action === 'insert_user') {
    if (!payload) throw new Error('Payload invalido');
    var usersSheet = ss.getSheetByName('Usuarios');
    if (!usersSheet) {
      usersSheet = ss.insertSheet('Usuarios');
      usersSheet.appendRow(['id', 'name', 'username', 'password', 'isAdmin', 'role']);
    }
    var lastRow = usersSheet.getLastRow();
    var headers = usersSheet.getRange(1, 1, 1, usersSheet.getLastColumn()).getValues()[0];
    
    var cleanRow = [];
    for (var i = 0; i < headers.length; i++) {
      var val = payload.user[headers[i]];
      cleanRow.push(val !== undefined && val !== null ? val : '');
    }
    
    var found = false;
    if (lastRow > 1) {
      var idColIndex = headers.indexOf('id') + 1;
      if (idColIndex > 0) {
        var dataRange = usersSheet.getRange(2, 1, lastRow - 1, usersSheet.getLastColumn()).getValues();
        for (var j = 0; j < dataRange.length; j++) {
          if (String(dataRange[j][idColIndex - 1]) === String(payload.user.id)) {
            usersSheet.getRange(j + 2, 1, 1, cleanRow.length).setValues([cleanRow]);
            found = true;
            break;
          }
        }
      }
    }
    if (!found) {
      usersSheet.appendRow(cleanRow);
    }
    return { status: 'ok' };
  } else if (action === 'delete_user') {
    if (!payload) throw new Error('Payload invalido');
    var usersSheet = ss.getSheetByName('Usuarios');
    if (usersSheet) {
      var lastRow = usersSheet.getLastRow();
      if (lastRow > 1 && payload.id !== undefined) {
        var headers = usersSheet.getRange(1, 1, 1, usersSheet.getLastColumn()).getValues()[0];
        var idColIndex = headers.indexOf('id') + 1;
        if (idColIndex > 0) {
          var idColValues = usersSheet.getRange(2, idColIndex, lastRow - 1, 1).getValues();
          for (var j = 0; j < idColValues.length; j++) {
            if (String(idColValues[j][0]) === String(payload.id)) {
              usersSheet.deleteRow(j + 2);
              break;
            }
          }
        }
      }
    }
    return { status: 'ok' };
  } else {
    return { status: 'error', message: 'Acao invalida: ' + action };
  }
}

function doPost(e) {
  try {
    var result = processRequest(e, true);
    var callback = e && e.parameter && e.parameter.callback;
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    var callback = e && e.parameter && e.parameter.callback;
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + JSON.stringify({ status: 'error', message: err.toString() }) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
}

function doGet(e) {
  try {
    var result = processRequest(e, false);
    var callback = e && e.parameter && e.parameter.callback;
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    var callback = e && e.parameter && e.parameter.callback;
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + JSON.stringify({ status: 'error', message: err.toString() }) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
}
`;
