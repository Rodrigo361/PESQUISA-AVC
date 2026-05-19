import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getFormDefinition, saveFormDefinition, FormDefinition, FormBlock, FormField } from '../lib/formDefinition';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Save, Plus, Trash2, GripVertical, ChevronDown, ChevronUp, X } from 'lucide-react';
import { toast } from 'sonner';

export function FormEditor() {
  const { isAdmin } = useAuth();
  const [formDef, setFormDef] = useState<FormDefinition | null>(null);

  useEffect(() => {
    if (isAdmin) {
      setFormDef(getFormDefinition());
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return <div className="p-8 text-center text-destructive">Acesso negado. Apenas administradores podem editar o formulário.</div>;
  }

  if (!formDef) return <div>Carregando...</div>;

  const handleSave = () => {
    saveFormDefinition(formDef);
    toast.success('Formulário salvo com sucesso!');
  };

  const addBlock = () => {
    const newBlock: FormBlock = {
      id: `block_${Date.now()}`,
      title: 'Novo Bloco',
      fields: []
    };
    setFormDef({ ...formDef, blocks: [...formDef.blocks, newBlock] });
  };

  const updateBlockTitle = (blockId: string, title: string) => {
    setFormDef({
      ...formDef,
      blocks: formDef.blocks.map(b => b.id === blockId ? { ...b, title } : b)
    });
  };

  const deleteBlock = (blockId: string) => {
    setFormDef({
      ...formDef,
      blocks: formDef.blocks.filter(b => b.id !== blockId)
    });
  };

  const addField = (blockId: string) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: 'Nova Pergunta',
      type: 'texto',
    };
    setFormDef({
      ...formDef,
      blocks: formDef.blocks.map(b => 
        b.id === blockId ? { ...b, fields: [...b.fields, newField] } : b
      )
    });
  };

  const updateField = (blockId: string, fieldId: string, updates: Partial<FormField>) => {
    setFormDef({
      ...formDef,
      blocks: formDef.blocks.map(b => 
        b.id === blockId ? {
          ...b,
          fields: b.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
        } : b
      )
    });
  };

  const deleteField = (blockId: string, fieldId: string) => {
    setFormDef({
      ...formDef,
      blocks: formDef.blocks.map(b => 
        b.id === blockId ? {
          ...b,
          fields: b.fields.filter(f => f.id !== fieldId)
        } : b
      )
    });
  };

  const addOption = (blockId: string, fieldId: string) => {
    setFormDef({
      ...formDef,
      blocks: formDef.blocks.map(b => 
        b.id === blockId ? {
          ...b,
          fields: b.fields.map(f => {
            if (f.id === fieldId) {
              const options = f.options || [];
              return { ...f, options: [...options, { value: `opt_${Date.now()}`, label: 'Nova Opção' }] };
            }
            return f;
          })
        } : b
      )
    });
  };

  const updateOption = (blockId: string, fieldId: string, optionIndex: number, updates: { value?: string, label?: string }) => {
    setFormDef({
      ...formDef,
      blocks: formDef.blocks.map(b => 
        b.id === blockId ? {
          ...b,
          fields: b.fields.map(f => {
            if (f.id === fieldId && f.options) {
              const newOptions = [...f.options];
              newOptions[optionIndex] = { ...newOptions[optionIndex], ...updates };
              return { ...f, options: newOptions };
            }
            return f;
          })
        } : b
      )
    });
  };

  const deleteOption = (blockId: string, fieldId: string, optionIndex: number) => {
    setFormDef({
      ...formDef,
      blocks: formDef.blocks.map(b => 
        b.id === blockId ? {
          ...b,
          fields: b.fields.map(f => {
            if (f.id === fieldId && f.options) {
              const newOptions = [...f.options];
              newOptions.splice(optionIndex, 1);
              return { ...f, options: newOptions };
            }
            return f;
          })
        } : b
      )
    });
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === formDef.blocks.length - 1)) return;
    const newBlocks = [...formDef.blocks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
    setFormDef({ ...formDef, blocks: newBlocks });
  };

  const moveField = (blockId: string, index: number, direction: 'up' | 'down') => {
    setFormDef({
      ...formDef,
      blocks: formDef.blocks.map(b => {
        if (b.id === blockId) {
          if ((direction === 'up' && index === 0) || (direction === 'down' && index === b.fields.length - 1)) return b;
          const newFields = [...b.fields];
          const swapIndex = direction === 'up' ? index - 1 : index + 1;
          [newFields[index], newFields[swapIndex]] = [newFields[swapIndex], newFields[index]];
          return { ...b, fields: newFields };
        }
        return b;
      })
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur z-10 py-4 border-b">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Editor de Formulário</h2>
          <p className="text-muted-foreground mt-1">Personalize as perguntas e opções do formulário de coleta.</p>
        </div>
        <Button onClick={handleSave} size="lg">
          <Save className="mr-2 h-5 w-5" />
          Salvar Alterações
        </Button>
      </div>

      <div className="space-y-8">
        {formDef.blocks.map((block, blockIndex) => (
          <Card key={block.id} className="border-2 border-primary/20">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex flex-col">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveBlock(blockIndex, 'up')} disabled={blockIndex === 0}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveBlock(blockIndex, 'down')} disabled={blockIndex === formDef.blocks.length - 1}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 max-w-md">
                    <Label className="text-xs text-muted-foreground mb-1 block">Título do Bloco</Label>
                    <Input 
                      value={block.title} 
                      onChange={(e) => updateBlockTitle(block.id, e.target.value)}
                      className="font-bold text-lg"
                    />
                  </div>
                </div>
                <Button variant="destructive" size="icon" onClick={() => deleteBlock(block.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {block.fields.map((field, fieldIndex) => (
                <div key={field.id} className="border rounded-lg p-4 bg-card shadow-sm relative group">
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveField(block.id, fieldIndex, 'up')} disabled={fieldIndex === 0}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveField(block.id, fieldIndex, 'down')} disabled={fieldIndex === block.fields.length - 1}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="pl-8 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                        <div className="space-y-1">
                          <Label>ID da Variável (único)</Label>
                          <Input 
                            value={field.id} 
                            onChange={(e) => updateField(block.id, field.id, { id: e.target.value })}
                            className="font-mono text-sm"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <Label>Pergunta / Rótulo</Label>
                          <Input 
                            value={field.label} 
                            onChange={(e) => updateField(block.id, field.id, { label: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive mt-6" onClick={() => deleteField(block.id, field.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label>Tipo de Campo</Label>
                        <Select 
                          value={field.type} 
                          onValueChange={(value: any) => updateField(block.id, field.id, { type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="texto">Texto</SelectItem>
                            <SelectItem value="numero">Número</SelectItem>
                            <SelectItem value="data">Data</SelectItem>
                            <SelectItem value="datetime">Data e Hora</SelectItem>
                            <SelectItem value="select">Seleção (Única Escolha)</SelectItem>
                            <SelectItem value="multiselect">Seleção (Múltipla Escolha)</SelectItem>
                            <SelectItem value="telefone">Telefone</SelectItem>
                            <SelectItem value="calculado">Calculado (Apenas Leitura)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Descrição / Ajuda (opcional)</Label>
                        <Input 
                          value={field.description || ''} 
                          onChange={(e) => updateField(block.id, field.id, { description: e.target.value })}
                          placeholder="Texto de ajuda para o pesquisador..."
                        />
                      </div>
                    </div>

                    {(field.type === 'select' || field.type === 'multiselect') && (
                      <div className="mt-4 p-4 bg-muted/30 rounded-md border">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="font-semibold">Opções de Resposta</Label>
                          <Button variant="outline" size="sm" onClick={() => addOption(block.id, field.id)}>
                            <Plus className="h-3 w-3 mr-1" /> Adicionar Opção
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {field.options?.map((opt, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <Input 
                                placeholder="Valor (ex: 1)" 
                                value={opt.value} 
                                onChange={(e) => updateOption(block.id, field.id, optIndex, { value: e.target.value })}
                                className="w-1/3 font-mono text-sm"
                              />
                              <Input 
                                placeholder="Rótulo (ex: Sim)" 
                                value={opt.label} 
                                onChange={(e) => updateOption(block.id, field.id, optIndex, { label: e.target.value })}
                                className="flex-1"
                              />
                              <Button variant="ghost" size="icon" onClick={() => deleteOption(block.id, field.id, optIndex)}>
                                <X className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          ))}
                          {(!field.options || field.options.length === 0) && (
                            <p className="text-sm text-muted-foreground italic">Nenhuma opção adicionada.</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-2 p-3 bg-muted/20 rounded border border-dashed">
                      <Label className="text-xs text-muted-foreground mb-2 block">Regra de Exibição Condicional (Opcional)</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          placeholder="ID do campo dependente" 
                          value={field.condition?.field || ''}
                          onChange={(e) => updateField(block.id, field.id, { 
                            condition: { field: e.target.value, value: field.condition?.value || '' } 
                          })}
                          className="w-1/3 font-mono text-xs"
                        />
                        <span className="text-sm text-muted-foreground">==</span>
                        <Input 
                          placeholder="Valor esperado" 
                          value={Array.isArray(field.condition?.value) ? field.condition?.value.join(',') : field.condition?.value || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const parsedVal = val.includes(',') ? val.split(',').map(v => v.trim()) : val;
                            updateField(block.id, field.id, { 
                              condition: { field: field.condition?.field || '', value: parsedVal } 
                            });
                          }}
                          className="flex-1 font-mono text-xs"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Ex: Campo: "reconheceu_sintomas", Valor: "1,3" (separado por vírgula para múltiplos valores)</p>
                    </div>

                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full border-dashed" onClick={() => addField(block.id)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Pergunta a este Bloco
              </Button>
            </CardContent>
          </Card>
        ))}

        <Button variant="default" size="lg" className="w-full" onClick={addBlock}>
          <Plus className="mr-2 h-5 w-5" />
          Adicionar Novo Bloco
        </Button>
      </div>
    </div>
  );
}
