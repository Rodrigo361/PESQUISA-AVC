import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { savePatient, getPatients } from '../lib/storage';
import { sendToGoogleSheets, isGoogleSheetsConfigured } from '../lib/googleSheets';
import { PatientData } from '../lib/types';
import { getFormDefinition, FormField } from '../lib/formDefinition';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Save, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { differenceInYears } from 'date-fns';

const INITIAL_DATA: Partial<PatientData> = {
  status: 'rascunho',
  answers: {}
};

export function NewCollection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  const formDef = getFormDefinition();
  const BLOCKS = formDef.blocks;

  const isMonitorDesfecho = user?.role === 'monitor_desfecho';
  const initialTab = searchParams.get('tab') || (isMonitorDesfecho ? 'bloco7' : BLOCKS[0].id);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [formData, setFormData] = useState<any>(INITIAL_DATA);
  const [isSaving, setIsSaving] = useState(false);

  // Filter blocks for monitor_desfecho
  const visibleBlocks = isMonitorDesfecho 
    ? BLOCKS.filter(b => b.id === 'bloco7')
    : BLOCKS;

  useEffect(() => {
    if (editId) {
      const patients = getPatients();
      const patient = patients.find(p => p.id === editId);
      if (patient) {
        setFormData(patient);
      } else {
        toast.error('Coleta não encontrada.');
        navigate('/pacientes');
      }
    } else {
      setFormData({
        ...INITIAL_DATA,
        answers: {}
      });
    }
  }, [editId, navigate]);

  const handleChange = (fieldId: string, value: any) => {
    setFormData((prev: any) => {
      const newAnswers = { ...prev.answers, [fieldId]: value };
      
      // Auto-calculate age
      if (fieldId === 'data_nascimento' && value) {
        try {
          const birthDate = new Date(value);
          const today = new Date();
          const age = differenceInYears(today, birthDate);
          if (!isNaN(age)) {
            newAnswers['idade'] = age;
          }
        } catch (e) {}
      }

      // Auto-calculate IMC
      if ((fieldId === 'peso' || fieldId === 'altura') && newAnswers.peso && newAnswers.altura) {
        const peso = parseFloat(newAnswers.peso);
        const altura = parseFloat(newAnswers.altura);
        if (peso > 0 && altura > 0) {
          newAnswers['imc'] = (peso / (altura * altura)).toFixed(2);
        }
      }

      // Auto-calculate dias_internacao
      if (fieldId === 'data_alta' || fieldId === 'data_hora_obito' || fieldId === 'chegada_primeiro_servico') {
        const admissionDateStr = newAnswers['chegada_primeiro_servico'];
        const dischargeDateStr = newAnswers['data_alta'] || newAnswers['data_hora_obito'];
        
        if (admissionDateStr && dischargeDateStr) {
          try {
            const admissionDate = new Date(admissionDateStr);
            const dischargeDate = new Date(dischargeDateStr);
            const diffTime = Math.abs(dischargeDate.getTime() - admissionDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (!isNaN(diffDays)) {
              newAnswers['dias_internacao'] = diffDays;
            }
          } catch (e) {}
        }
      }

      return { ...prev, answers: newAnswers };
    });
  };

  const handleExtraChange = (field: keyof PatientData, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (status: 'rascunho' | 'finalizado') => {
    if (!user) return;

    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const prontuario = formData.answers?.prontuario_id;
      let patientId = formData.id;
      let createdAt = formData.createdAt || now;
      let mergedAnswers = { ...formData.answers };

      // Check for existing patient by prontuario to avoid duplication
      if (!editId && prontuario) {
        const existingPatients = getPatients();
        const existing = existingPatients.find(p => p.answers?.prontuario_id === prontuario);
        if (existing) {
          patientId = existing.id;
          createdAt = existing.createdAt;
          
          // Only merge fields that have actual values in the new form
          const newAnswers = { ...formData.answers };
          Object.keys(newAnswers).forEach(key => {
            if (newAnswers[key] === undefined || newAnswers[key] === '') {
              delete newAnswers[key];
            }
          });
          
          mergedAnswers = { ...existing.answers, ...newAnswers };
          toast.info('Registro existente encontrado. Dados foram atualizados na mesma ficha.');
        }
      }

      const patientData: PatientData = {
        ...formData,
        id: patientId || crypto.randomUUID(),
        researcherId: user.id,
        researcherName: user.name,
        status,
        createdAt: createdAt,
        updatedAt: now,
        currentBlock: BLOCKS.findIndex(b => b.id === activeTab),
        answers: mergedAnswers || {}
      };

      savePatient(patientData);
      
      if (status === 'finalizado') {
        const isConfigured = await isGoogleSheetsConfigured();
        if (isConfigured) {
          const success = await sendToGoogleSheets(patientData);
          if (success) {
            toast.success('Coleta finalizada e enviada para a nuvem!');
          } else {
            toast.warning('Coleta finalizada localmente. Erro ao enviar para a nuvem.');
          }
        } else {
          toast.success('Coleta finalizada localmente!');
        }
        if (user.role === 'monitor_desfecho') {
          navigate('/gestao-altas');
        } else {
          navigate('/pacientes');
        }
      } else {
        toast.success('Rascunho salvo com sucesso!');
        if (!editId) {
          navigate(`/nova-coleta?id=${patientData.id}`, { replace: true });
        }
      }
    } catch (error) {
      toast.error('Erro ao salvar coleta.');
    } finally {
      setIsSaving(false);
    }
  };

  const nextTab = () => {
    const currentIndex = visibleBlocks.findIndex(b => b.id === activeTab);
    if (currentIndex < visibleBlocks.length - 1) {
      setActiveTab(visibleBlocks[currentIndex + 1].id);
      window.scrollTo(0, 0);
    }
  };

  const prevTab = () => {
    const currentIndex = visibleBlocks.findIndex(b => b.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(visibleBlocks[currentIndex - 1].id);
      window.scrollTo(0, 0);
    }
  };

  const checkCondition = (condition?: { field: string, value: string | string[] }) => {
    if (!condition) return true;
    const answer = formData.answers?.[condition.field];
    if (Array.isArray(condition.value)) {
      return condition.value.includes(answer);
    }
    return answer === condition.value;
  };

  const renderField = (field: FormField) => {
    if (!checkCondition(field.condition)) return null;

    const value = formData.answers?.[field.id] || '';

    return (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={field.id}>{field.label}</Label>
        
        {field.type === 'texto' && (
          <Input 
            id={field.id} 
            value={value} 
            onChange={(e) => handleChange(field.id, e.target.value)} 
          />
        )}
        
        {field.type === 'data' && (
          <Input 
            id={field.id} 
            type="date" 
            value={value} 
            onChange={(e) => handleChange(field.id, e.target.value)} 
          />
        )}
        
        {field.type === 'datetime' && (
          <Input 
            id={field.id} 
            type="datetime-local" 
            value={value} 
            onChange={(e) => handleChange(field.id, e.target.value)} 
          />
        )}
        
        {field.type === 'numero' && (
          <Input 
            id={field.id} 
            type="number" 
            min={field.min}
            max={field.max}
            step="any"
            value={value} 
            onChange={(e) => handleChange(field.id, e.target.value)} 
          />
        )}

        {field.type === 'telefone' && (
          <Input 
            id={field.id} 
            type="tel" 
            value={value} 
            onChange={(e) => handleChange(field.id, e.target.value)} 
          />
        )}
        
        {field.type === 'calculado' && (
          <Input 
            id={field.id} 
            value={value} 
            readOnly 
            className="bg-muted"
          />
        )}
        
        {field.type === 'select' && field.options && (
          <Select value={value} onValueChange={(v) => handleChange(field.id, v)}>
            <SelectTrigger id={field.id}>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {field.options.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {field.type === 'multiselect' && field.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {field.options.map(opt => {
              const checked = Array.isArray(value) ? value.includes(opt.value) : false;
              return (
                <label key={opt.value} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={checked}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      let newValue = Array.isArray(value) ? [...value] : [];
                      if (isChecked) {
                        newValue.push(opt.value);
                      } else {
                        newValue = newValue.filter(v => v !== opt.value);
                      }
                      handleChange(field.id, newValue);
                    }}
                  />
                  <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{opt.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {editId ? (isMonitorDesfecho ? 'Registrar Alta' : 'Editar Coleta') : 'Nova Coleta'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {editId && formData.answers?.nome_completo 
              ? `Paciente: ${formData.answers.nome_completo}` 
              : 'Preencha os dados do paciente.'}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => handleSave('rascunho')}
            disabled={isSaving}
            className="flex-1 sm:flex-none"
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar Rascunho
          </Button>
          <Button 
            onClick={() => handleSave('finalizado')}
            disabled={isSaving}
            className="flex-1 sm:flex-none"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Finalizar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <TabsList className="w-max inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
            {visibleBlocks.map((block) => (
              <TabsTrigger key={block.id} value={block.id} className="whitespace-nowrap">
                {block.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {visibleBlocks.map((block, index) => (
          <TabsContent key={block.id} value={block.id}>
            <Card>
              <CardHeader>
                <CardTitle>{block.title}</CardTitle>
                <CardDescription>Preencha os campos abaixo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {block.fields.map(renderField)}
                </div>

                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={prevTab}
                    disabled={index === 0}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                  </Button>
                  
                  {index < visibleBlocks.length - 1 ? (
                    <Button onClick={nextTab}>
                      Próximo <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={() => handleSave('finalizado')} disabled={isSaving}>
                      <CheckCircle className="mr-2 h-4 w-4" /> Finalizar Coleta
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
