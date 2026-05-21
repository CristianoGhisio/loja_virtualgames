'use client';

import { use, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { MessageSquare, Send } from 'lucide-react';
import { Select } from '@/components/ui/native-select';

interface Interaction {
  id: string;
  type: string;
  content: string;
  createdAt: string;
}

export default function SupplierInteractionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [newType, setNewType] = useState('NOTE');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchInteractions = async () => {
    try {
      const res = await api.get(`/suppliers/${id}/interactions`);
      setInteractions(res.data);
    } catch (error) {
      console.error('Failed to fetch interactions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInteractions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent) return;

    setSubmitting(true);
    try {
      await api.post(`/suppliers/${id}/interactions`, {
        type: newType,
        content: newContent,
      });
      setNewContent('');
      fetchInteractions();
    } catch (error) {
      console.error('Failed to create interaction', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-300">
      <Card>
        <CardHeader className="border-b border-[rgba(255,255,255,0.06)] pb-4">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-neon-blue" />
            Nova Interação
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <Select 
                  value={newType} 
                  onChange={(e) => setNewType(e.target.value)}
                  label="Tipo"
                  className="bg-black/20 border-[rgba(255,255,255,0.1)] text-white focus:border-neon-blue"
                >
                  <option value="NOTE">Nota</option>
                  <option value="CALL">Ligação</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="EMAIL">Email</option>
                  <option value="VISIT">Visita</option>
                </Select>
              </div>
              <div className="md:col-span-3">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input 
                      label="Descrição"
                      placeholder="Descreva a interação..." 
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="bg-black/20 border-[rgba(255,255,255,0.1)] text-white focus:border-neon-blue"
                    />
                  </div>
                  <Button type="submit" disabled={submitting || !newContent} variant="neon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {interactions.map((interaction) => (
          <Card key={interaction.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-1 rounded bg-neon-blue/10 text-neon-blue uppercase">
                    {interaction.type}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(interaction.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
              <p className="text-slate-300 whitespace-pre-wrap">{interaction.content}</p>
            </CardContent>
          </Card>
        ))}
        {interactions.length === 0 && !loading && (
          <p className="text-center text-gray-400 py-8">Nenhuma interação registrada.</p>
        )}
      </div>
    </div>
  );
}
