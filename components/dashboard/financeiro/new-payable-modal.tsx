'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/native-select';
import { Modal } from '@/components/ui/modal';

interface NewPayableData {
  id: string;
  description: string;
  value: number;
  dueDate: string;
  category: string;
  status: string;
}

interface NewPayableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NewPayableData) => void;
}

export function NewPayableModal({ isOpen, onClose, onSave }: NewPayableModalProps) {
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!description || !value || !dueDate || !category) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      onSave({
        id: `PAG-${Math.floor(Math.random() * 1000)}`,
        description,
        value: Number(value),
        dueDate,
        category,
        status: 'Pendente'
      });
      setLoading(false);
      onClose();
      // Reset form
      setDescription('');
      setValue('');
      setDueDate('');
      setCategory('');
    }, 1000);
  };

  if (typeof document === 'undefined' || !isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova Despesa"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            className="bg-red-500 hover:bg-red-600 text-white font-bold"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Lançar Despesa'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input 
          label="Descrição" 
          placeholder="Ex: Conta de Luz" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Valor (R$)" 
            type="number" 
            placeholder="0.00" 
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Input 
            label="Vencimento" 
            type="date" 
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <Select 
          label="Categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Selecione...</option>
          <option value="Despesas Fixas">Despesas Fixas</option>
          <option value="Fornecedores">Fornecedores</option>
          <option value="Impostos">Impostos</option>
          <option value="Outros">Outros</option>
        </Select>
      </div>
    </Modal>
  );
}
