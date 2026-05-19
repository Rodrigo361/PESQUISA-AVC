import React, { useRef } from 'react';
import { PatientData } from '../lib/types';
import { getFormDefinition } from '../lib/formDefinition';
import { Button } from './ui/button';
import { X, Download } from 'lucide-react';
import { format } from 'date-fns';
import html2pdf from 'html2pdf.js';

interface PatientCoverSheetProps {
  patient: PatientData;
  onClose: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6 border rounded-lg p-4 bg-card">
    <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-primary">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
  </div>
);

const Field: React.FC<{ label: string; value: string | number | undefined | null | boolean }> = ({ label, value }) => {
  let displayValue = value;
  if (typeof value === 'boolean') {
    displayValue = value ? 'Sim' : 'Não';
  }
  return (
    <div className="flex flex-col">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{displayValue?.toString() || '—'}</span>
    </div>
  );
};

export function PatientCoverSheet({ patient, onClose }: PatientCoverSheetProps) {
  const formDef = getFormDefinition();
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    if (!contentRef.current) return;
    
    const element = contentRef.current;
    const opt = {
      margin:       10,
      filename:     `Ficha_Paciente_${patient.answers?.nome_completo || 'Sem_Nome'}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };

  const checkCondition = (condition?: { field: string, value: string | string[] }) => {
    if (!condition) return true;
    const answer = patient.answers?.[condition.field];
    if (Array.isArray(condition.value)) {
      return condition.value.includes(answer);
    }
    return answer === condition.value;
  };

  const getOptionLabel = (field: any, value: any) => {
    if (!field.options || !value) return value;
    if (field.type === 'multiselect' && Array.isArray(value)) {
      return value.map((v: string) => {
        const option = field.options.find((o: any) => o.value === v);
        return option ? option.label : v;
      }).join(', ');
    }
    const option = field.options.find((o: any) => o.value === value);
    return option ? option.label : value;
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex justify-center overflow-y-auto p-4 md:p-8">
      <div className="bg-background border shadow-xl rounded-xl w-full max-w-5xl relative flex flex-col">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b bg-background/95 backdrop-blur no-print rounded-t-xl">
          <h2 className="text-xl font-bold">Folha de Rosto - {patient.answers?.nome_completo || 'Paciente sem nome'}</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Baixar PDF
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 md:p-8 flex-1" ref={contentRef}>
          <div className="mb-8 text-center border-b pb-4">
            <h1 className="text-2xl font-bold">Estudo Epidemiológico de AVC - Sobral/CE</h1>
            <p className="text-muted-foreground">Folha de Rosto de Coleta de Dados</p>
            <div className="flex justify-between mt-4 text-sm">
              <span>Pesquisador: {patient.researcherName}</span>
              <span>Data de Geração: {format(new Date(), 'dd/MM/yyyy HH:mm')}</span>
            </div>
          </div>

          {formDef.blocks.map(block => (
            <Section key={block.id} title={block.title}>
              {block.fields.map(field => {
                if (!checkCondition(field.condition)) return null;
                const rawValue = patient.answers?.[field.id];
                const displayValue = (field.type === 'select' || field.type === 'multiselect') ? getOptionLabel(field, rawValue) : rawValue;
                
                return (
                  <Field 
                    key={field.id} 
                    label={field.label} 
                    value={displayValue} 
                  />
                );
              })}
            </Section>
          ))}

          <div className="mt-8 pt-4 border-t text-sm text-muted-foreground flex justify-between">
            <span>ID: {patient.id}</span>
            <span>Status: {patient.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}</span>
            <span>Criado em: {format(new Date(patient.createdAt), 'dd/MM/yyyy HH:mm')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
