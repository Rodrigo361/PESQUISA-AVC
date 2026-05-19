import { differenceInMinutes, parseISO } from 'date-fns';
import { PatientData } from './types';

export function parseDateTime(dateStr: string, timeStr: string): Date | null {
  if (!dateStr || !timeStr) return null;
  try {
    return parseISO(`${dateStr}T${timeStr}`);
  } catch (e) {
    return null;
  }
}

export function calcPortaAgulha(p: PatientData): number | null {
  const chegada = parseDateTime(p.answers?.data_chegada_hospital_definitivo, p.answers?.hora_chegada_hospital_definitivo);
  const tratamento = parseDateTime(p.answers?.data_inicio_tratamento, p.answers?.hora_inicio_tratamento);
  
  if (chegada && tratamento) {
    return differenceInMinutes(tratamento, chegada);
  }
  return null;
}

export function calcPortaTC(p: PatientData): number | null {
  const chegada = parseDateTime(p.answers?.data_chegada_hospital_definitivo, p.answers?.hora_chegada_hospital_definitivo);
  const tc = parseDateTime(p.answers?.data_tomografia, p.answers?.hora_tomografia);
  
  if (chegada && tc) {
    return differenceInMinutes(tc, chegada);
  }
  return null;
}

export function calcSintomasAteTratamento(p: PatientData): number | null {
  const sintomas = parseDateTime(p.answers?.data_inicio_sintomas, p.answers?.hora_inicio_sintomas);
  const tratamento = parseDateTime(p.answers?.data_inicio_tratamento, p.answers?.hora_inicio_tratamento);
  
  if (sintomas && tratamento) {
    return differenceInMinutes(tratamento, sintomas);
  }
  return null;
}

export function calcSintomasAteTC(p: PatientData): number | null {
  const sintomas = parseDateTime(p.answers?.data_inicio_sintomas, p.answers?.hora_inicio_sintomas);
  const tc = parseDateTime(p.answers?.data_tomografia, p.answers?.hora_tomografia);
  
  if (sintomas && tc) {
    return differenceInMinutes(tc, sintomas);
  }
  return null;
}

export function calcSintomasAteHospital(p: PatientData): number | null {
  const sintomas = parseDateTime(p.answers?.data_inicio_sintomas, p.answers?.hora_inicio_sintomas);
  const hospital = parseDateTime(p.answers?.data_chegada_hospital_definitivo, p.answers?.hora_chegada_hospital_definitivo);
  
  if (sintomas && hospital) {
    return differenceInMinutes(hospital, sintomas);
  }
  return null;
}

export function formatMinutes(mins: number | null): string {
  if (mins === null || isNaN(mins)) return '—';
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}min` : `${hours}h`;
}

export function average(values: (number | null)[]): number {
  const validValues = values.filter((v): v is number => v !== null && !isNaN(v));
  if (validValues.length === 0) return 0;
  const sum = validValues.reduce((a, b) => a + b, 0);
  return Math.round(sum / validValues.length);
}
