'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock3, Plus, RefreshCw, AlertCircle, Trash2, ShoppingCart, Wrench, MessageCircle, Send, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select } from '@/components/ui/native-select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const POLL_INTERACTIONS_MS = 3000;
const REFRESH_CARDS_MS = 30000;

type FunnelStage =
  | 'NOVO_CONTATO'
  | 'EM_ANDAMENTO'
  | 'CONTATO_QUENTE'
  | 'VENDA_CONCLUIDA'
  | 'FEEDBACK_REALIZADO';

type FunnelCard = {
  id: string;
  customerId: string;
  stage: FunnelStage;
  customerName: string;
  customerPhone: string | null;
  sellerNote: string | null;
  itemInterest: string | null;
  hasNewMessage: boolean;
  createdAt: string;
  updatedAt: string;
  lastStageChangeAt: string;
  productFlowStatus?: string | null;
  serviceFlowStatus?: string | null;
};

type Interaction = {
  id: string;
  type: string;
  content: string;
  createdAt: string;
};

type InterestItem = {
  id: string;
  type: 'PRODUCT' | 'SERVICE';
  name: string;
  price?: number;
};

type CatalogProduct = {
  id: string;
  commercialName: string;
  price: number;
};

type CatalogService = {
  id: string;
  name: string;
  priceBase: number;
};

type FeedbackPreview = {
  customerName: string;
  customerPhone: string | null;
  targetType: 'SALE' | 'SERVICE';
  eventName: string;
  eventDate: string;
  defaultMessage: string;
};

const COLUMNS: Array<{ id: FunnelStage; title: string }> = [
  { id: 'NOVO_CONTATO', title: 'Novo Contato' },
  { id: 'EM_ANDAMENTO', title: 'Em Andamento' },
  { id: 'CONTATO_QUENTE', title: 'Contato Interessado' },
  { id: 'VENDA_CONCLUIDA', title: 'Venda ou serviço Realizado' },
  { id: 'FEEDBACK_REALIZADO', title: 'Solicitar Feedbackk' },
];

function isClientMessage(type: string): boolean {
  return type === 'WHATSAPP' || type === 'PESQUISA_SATISFACAO';
}

function isSystemMessage(type: string): boolean {
  return type === 'CRM';
}

function parseInterestPayload(raw: string | null): InterestItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as InterestItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item?.id && item?.name && (item.type === 'PRODUCT' || item.type === 'SERVICE'));
  } catch {
    return [];
  }
}

function formatInterestText(items: InterestItem[]): string {
  if (items.length === 0) return '';
  return items.map((item) => item.name).join(', ');
}

function formatDuration(dateIso: string) {
  const now = Date.now();
  const start = new Date(dateIso).getTime();
  const diffMinutes = Math.max(0, Math.floor((now - start) / 60000));
  if (diffMinutes < 60) return `${diffMinutes} min`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} d`;
}

function formatMessageTime(dateIso: string) {
  return new Date(dateIso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function ChatBubble({ interaction }: { interaction: Interaction }) {
  const isClient = isClientMessage(interaction.type);
  const isSystem = isSystemMessage(interaction.type);
  const time = formatMessageTime(interaction.createdAt);

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-slate-800/60 rounded-full px-4 py-1.5 max-w-[80%]">
          <p className="text-xs text-slate-400 text-center whitespace-pre-wrap">{interaction.content}</p>
          <p className="text-[10px] text-slate-500 text-center mt-0.5">{time}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isClient ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
          isClient
            ? 'bg-slate-800 border border-slate-700/50 rounded-tl-sm'
            : 'bg-cyan-600/80 border border-cyan-500/30 rounded-tr-sm'
        }`}
      >
        <p className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">{interaction.content}</p>
        <div className={`flex items-center gap-1 mt-1 ${isClient ? 'justify-start' : 'justify-end'}`}>
          <p className="text-[10px] text-slate-400">{time}</p>
          {!isClient && <CheckCheck className="w-3 h-3 text-cyan-300" />}
        </div>
      </div>
    </div>
  );
}

function SortableCard({
  card,
  onOpenInteractions,
  onDeleteCard,
  onOpenPreSale,
  onOpenPreService,
  onEditInterest,
}: {
  card: FunnelCard;
  onOpenInteractions: (card: FunnelCard) => void;
  onDeleteCard: (card: FunnelCard) => void;
  onOpenPreSale: (card: FunnelCard) => void;
  onOpenPreService: (card: FunnelCard) => void;
  onEditInterest: (card: FunnelCard) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const stageBorderClass =
    card.stage === 'CONTATO_QUENTE'
      ? 'border-emerald-500/70 hover:border-emerald-400'
      : 'border-white/10 hover:border-[#00a3ff]/60';
  const interestItems = parseInterestPayload(card.itemInterest);
  const hasProductInterest = interestItems.some((item) => item.type === 'PRODUCT');
  const hasServiceInterest = interestItems.some((item) => item.type === 'SERVICE');
  const productCompleted = card.productFlowStatus === 'COMPLETED' || card.productFlowStatus === 'IN_PROGRESS';
  const serviceCompleted = card.serviceFlowStatus === 'COMPLETED' || card.serviceFlowStatus === 'IN_PROGRESS';
  const interestText = interestItems.length > 0 ? formatInterestText(interestItems) : card.itemInterest;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className={`bg-[#0f172a] border rounded-xl transition-colors cursor-grab active:cursor-grabbing ${stageBorderClass}`}
        onClick={() => {
          if (card.stage === 'CONTATO_QUENTE') {
            onEditInterest(card);
          }
        }}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {card.hasNewMessage && (
                <div className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <MessageCircle className="relative h-4 w-4 text-cyan-400" />
                </div>
              )}
              <div>
                <p className="text-slate-100 font-semibold">{card.customerName}</p>
                <p className="text-xs text-slate-400">{card.customerPhone || 'Sem WhatsApp'}</p>
              </div>
            </div>
            <Badge variant="default">{formatDuration(card.lastStageChangeAt)}</Badge>
          </div>
          <div className="space-y-1 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Clock3 className="w-3 h-3" />
              <span>Atualizado: {new Date(card.updatedAt).toLocaleString('pt-BR')}</span>
            </div>
            {interestText ? <p>Interesse: {interestText}</p> : null}
            {card.sellerNote ? <p>Observação: {card.sellerNote}</p> : null}
          </div>
          {card.stage === 'CONTATO_QUENTE' ? (
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenPreSale(card);
                }}
                disabled={!hasProductInterest || productCompleted}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Pré-venda
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenPreService(card);
                }}
                disabled={!hasServiceInterest || serviceCompleted}
              >
                <Wrench className="w-4 h-4 mr-2" />
                Pré-serviço
              </Button>
            </div>
          ) : null}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onOpenInteractions(card);
              }}
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
              Conversa
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-rose-400 border-rose-500/40 hover:bg-rose-500/10"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onDeleteCard(card);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Column({
  stage,
  title,
  cards,
  onOpenInteractions,
  onDeleteCard,
  onOpenPreSale,
  onOpenPreService,
  onEditInterest,
  isDragOver,
}: {
  stage: FunnelStage;
  title: string;
  cards: FunnelCard[];
  onOpenInteractions: (card: FunnelCard) => void;
  onDeleteCard: (card: FunnelCard) => void;
  onOpenPreSale: (card: FunnelCard) => void;
  onOpenPreService: (card: FunnelCard) => void;
  onEditInterest: (card: FunnelCard) => void;
  isDragOver: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: stage });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border bg-slate-950/40 p-3 min-h-[540px] transition-colors ${
        isDragOver ? 'border-cyan-400 border-2 bg-slate-900/60' : 'border-cyan-400/20'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm uppercase font-bold text-gray-300 tracking-wide">{title}</h2>
        <Badge variant="outline" className="border-cyan-400/30 text-gray-300">{cards.length}</Badge>
      </div>
      <div className="space-y-3">
        <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              onOpenInteractions={onOpenInteractions}
              onDeleteCard={onDeleteCard}
              onOpenPreSale={onOpenPreSale}
              onOpenPreService={onOpenPreService}
              onEditInterest={onEditInterest}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default function AtendimentoPage() {
  const router = useRouter();
  const [cards, setCards] = useState<FunnelCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [transitionModalOpen, setTransitionModalOpen] = useState(false);
  const [interactionsModalOpen, setInteractionsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<FunnelCard | null>(null);
  const [selectedInteractionCard, setSelectedInteractionCard] = useState<FunnelCard | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<FunnelStage | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [interactionsLoading, setInteractionsLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replySending, setReplySending] = useState(false);

  const [newCustomerType, setNewCustomerType] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [newName, setNewName] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [newStage, setNewStage] = useState<FunnelStage>('NOVO_CONTATO');
  const [newNote, setNewNote] = useState('');
  const [newItemInterest, setNewItemInterest] = useState('');

  const [targetStage, setTargetStage] = useState<FunnelStage>('NOVO_CONTATO');
  const [transitionContactNote, setTransitionContactNote] = useState('');
  const [transitionObservation, setTransitionObservation] = useState('');
  const [sendFeedbackRequest, setSendFeedbackRequest] = useState(true);
  const [feedbackPreview, setFeedbackPreview] = useState<FeedbackPreview | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [loadingFeedbackPreview, setLoadingFeedbackPreview] = useState(false);

  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [catalogServices, setCatalogServices] = useState<CatalogService[]>([]);
  const [interestSearch, setInterestSearch] = useState('');
  const [transitionInterestItems, setTransitionInterestItems] = useState<InterestItem[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const interactionsPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const fetchCards = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const response = await api.get('/atendimento');
      setCards(Array.isArray(response.data) ? response.data : []);
    } catch {
      setCards([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const fetchInteractions = useCallback(async (customerId: string) => {
    try {
      const response = await api.get(`/clients/${customerId}/interactions`);
      const data = response.data as Interaction[];
      setInteractions(Array.isArray(data) ? data : []);
    } catch {
      setInteractions([]);
    }
  }, []);

  const stopPolling = useCallback(() => {
    if (interactionsPollRef.current) {
      clearInterval(interactionsPollRef.current);
      interactionsPollRef.current = null;
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  useEffect(() => {
    fetchCards(true);
    const interval = setInterval(() => fetchCards(), REFRESH_CARDS_MS);
    return () => clearInterval(interval);
  }, [fetchCards]);

  useEffect(() => {
    if (interactionsModalOpen && selectedInteractionCard) {
      scrollToBottom();
    }
  }, [interactions, interactionsModalOpen, selectedInteractionCard, scrollToBottom]);

  useEffect(() => {
    if (!interactionsModalOpen || !selectedInteractionCard) {
      stopPolling();
      return;
    }

    const customerId = selectedInteractionCard.customerId;
    interactionsPollRef.current = setInterval(() => {
      fetchInteractions(customerId);
    }, POLL_INTERACTIONS_MS);

    return () => {
      stopPolling();
    };
  }, [interactionsModalOpen, selectedInteractionCard, fetchInteractions, stopPolling]);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await api.get('/clients');
        const data = response.data as Array<{ id: string; name: string }>;
        setCustomers(data);
      } catch {
        setCustomers([]);
      }
    };
    loadCustomers();
  }, []);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [productsResponse, servicesResponse] = await Promise.all([
          api.get('/products', { params: { limit: 200 } }),
          api.get('/services', { params: { active: true } }),
        ]);

        const productsData = productsResponse.data?.data?.data as CatalogProduct[] | undefined;
        const servicesData = Array.isArray(servicesResponse.data?.data)
          ? (servicesResponse.data.data as CatalogService[])
          : Array.isArray(servicesResponse.data)
            ? (servicesResponse.data as CatalogService[])
            : [];

        setCatalogProducts(Array.isArray(productsData) ? productsData : []);
        setCatalogServices(Array.isArray(servicesData) ? servicesData : []);
      } catch {
        setCatalogProducts([]);
        setCatalogServices([]);
      }
    };
    loadCatalog();
  }, []);

  useEffect(() => {
    const loadFeedbackPreview = async () => {
      if (!selectedCard || !transitionModalOpen) return;
      if (!(selectedCard.stage === 'VENDA_CONCLUIDA' && targetStage === 'FEEDBACK_REALIZADO')) {
        setFeedbackPreview(null);
        setFeedbackMessage('');
        return;
      }

      setLoadingFeedbackPreview(true);
      try {
        const response = await api.get(`/atendimento/${selectedCard.id}/feedback-preview`);
        const preview = response.data as FeedbackPreview;
        setFeedbackPreview(preview);
        setFeedbackMessage(preview.defaultMessage || '');
      } catch {
        setFeedbackPreview(null);
        setFeedbackMessage('');
      } finally {
        setLoadingFeedbackPreview(false);
      }
    };
    loadFeedbackPreview();
  }, [selectedCard, transitionModalOpen, targetStage]);

  const cardsByStage = useMemo(() => {
    return COLUMNS.reduce<Record<FunnelStage, FunnelCard[]>>((acc, column) => {
      acc[column.id] = cards.filter((card) => card.stage === column.id);
      return acc;
    }, {
      NOVO_CONTATO: [],
      EM_ANDAMENTO: [],
      CONTATO_QUENTE: [],
      VENDA_CONCLUIDA: [],
      FEEDBACK_REALIZADO: [],
    });
  }, [cards]);

  const openTransitionModal = (card: FunnelCard, forcedStage?: FunnelStage) => {
    setSelectedCard(card);
    setTargetStage(forcedStage ?? card.stage);
    setTransitionContactNote(card.sellerNote || '');
    setTransitionInterestItems(parseInterestPayload(card.itemInterest));
    setInterestSearch('');
    setTransitionObservation('');
    setSendFeedbackRequest(true);
    setFeedbackMessage('');
    setFeedbackPreview(null);
    setTransitionError(null);
    setTransitionModalOpen(true);
  };

  const closeInteractionsModal = useCallback(() => {
    stopPolling();
    setInteractionsModalOpen(false);
    setSelectedInteractionCard(null);
    setInteractions([]);
    setReplyMessage('');
  }, [stopPolling]);

  const openInteractionsModal = async (card: FunnelCard) => {
    setSelectedInteractionCard(card);
    setInteractionsModalOpen(true);
    setInteractionsLoading(true);

    if (card.hasNewMessage) {
      try {
        await api.patch(`/atendimento/${card.id}/read`);
        setCards((prev) =>
          prev.map((c) => (c.id === card.id ? { ...c, hasNewMessage: false } : c))
        );
      } catch {
      }
    }

    await fetchInteractions(card.customerId);
    setInteractionsLoading(false);
    scrollToBottom();
  };

  const handleDeleteCard = async (card: FunnelCard) => {
    await api.delete(`/atendimento/${card.id}`);
    if (selectedInteractionCard?.id === card.id) {
      closeInteractionsModal();
    }
    await fetchCards();
  };

  const handleCreateCard = async () => {
    if (newCustomerType === 'EXISTING' && !selectedCustomerId) return;
    if (newCustomerType === 'NEW' && (!newName.trim() || !newWhatsapp.trim())) return;
    if (newStage === 'CONTATO_QUENTE' && !newItemInterest.trim()) return;

    await api.post('/atendimento', {
      customerId: newCustomerType === 'EXISTING' ? selectedCustomerId : undefined,
      name: newCustomerType === 'NEW' ? newName.trim() : undefined,
      whatsapp: newCustomerType === 'NEW' ? newWhatsapp.trim() : undefined,
      stage: newStage,
      sellerNote: newNote.trim() || undefined,
      itemInterest: newItemInterest.trim() || undefined,
    });

    setNewModalOpen(false);
    setSelectedCustomerId('');
    setNewName('');
    setNewWhatsapp('');
    setNewStage('NOVO_CONTATO');
    setNewNote('');
    setNewItemInterest('');
    await fetchCards();
  };

  const addInterestItem = (item: InterestItem) => {
    setTransitionInterestItems((current) => {
      if (current.some((existing) => existing.id === item.id && existing.type === item.type)) {
        return current;
      }
      return [...current, item];
    });
  };

  const removeInterestItem = (item: InterestItem) => {
    setTransitionInterestItems((current) =>
      current.filter((existing) => !(existing.id === item.id && existing.type === item.type))
    );
  };

  const handleApplyTransition = async () => {
    if (!selectedCard) return;
    const isFirstContactTransition =
      selectedCard.stage === 'NOVO_CONTATO' && targetStage === 'EM_ANDAMENTO';
    const isInterestTransition =
      selectedCard.stage === 'EM_ANDAMENTO' && targetStage === 'CONTATO_QUENTE';
    const isInterestEdit =
      selectedCard.stage === 'CONTATO_QUENTE' && targetStage === 'CONTATO_QUENTE';
    const isFeedbackTransition =
      selectedCard.stage === 'VENDA_CONCLUIDA' && targetStage === 'FEEDBACK_REALIZADO';

    if (!isFirstContactTransition && !isInterestTransition && !isInterestEdit && !isFeedbackTransition && !transitionObservation.trim()) {
      setTransitionError('Justificativa é obrigatória para mover o card');
      return;
    }
    if (targetStage === 'CONTATO_QUENTE' && transitionInterestItems.length === 0) {
      setTransitionError('Item de Interesse é obrigatório para etapa Contato Quente');
      return;
    }

    if (isFeedbackTransition && sendFeedbackRequest && !feedbackMessage.trim()) {
      setTransitionError('A mensagem de feedback não pode estar vazia');
      return;
    }

    setTransitionError(null);

    try {
      const payload: Record<string, unknown> = {
        stage: targetStage,
        observation:
          transitionObservation.trim() ||
          (isFirstContactTransition
            ? 'Primeiro atendimento iniciado.'
            : isInterestTransition
              ? 'Interesse do cliente registrado.'
              : isInterestEdit
                ? 'Interesse atualizado.'
                : isFeedbackTransition
                  ? 'Solicitação de feedback enviada.'
              : ''),
        sellerNote: transitionContactNote.trim() || undefined,
      };
      if (targetStage === 'CONTATO_QUENTE') {
        payload.itemInterest = JSON.stringify(transitionInterestItems);
      }
      if (isFeedbackTransition) {
        payload.requestFeedback = sendFeedbackRequest;
        payload.feedbackMessage = feedbackMessage.trim() || undefined;
      }

      await api.patch(`/atendimento/${selectedCard.id}`, payload);

      setTransitionModalOpen(false);
      setSelectedCard(null);
      setTransitionObservation('');
      await fetchCards();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      const message = error.response?.data?.error || 'Erro ao atualizar card';
      setTransitionError(message);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setDragOverColumn(null);
      return;
    }
    const overId = String(over.id);
    const overColumn = COLUMNS.find((col) => col.id === overId);
    if (overColumn) {
      setDragOverColumn(overColumn.id);
    } else {
      const overCard = cards.find((card) => card.id === overId);
      if (overCard) {
        setDragOverColumn(overCard.stage);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    setDragOverColumn(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const draggedCard = cards.find((card) => card.id === activeId);
    if (!draggedCard) return;

    const overColumn = COLUMNS.find((col) => col.id === overId);
    const targetStageId = overColumn ? overColumn.id : cards.find((c) => c.id === overId)?.stage;

    if (!targetStageId || targetStageId === draggedCard.stage) return;

    openTransitionModal(draggedCard, targetStageId);
  };

  const openPreSale = (card: FunnelCard) => {
    const interests = parseInterestPayload(card.itemInterest);
    const productIds = interests.filter((item) => item.type === 'PRODUCT').map((item) => item.id);
    if (productIds.length === 0) return;
    const params = new URLSearchParams();
    params.set('customerId', card.customerId);
    params.set('productIds', productIds.join(','));
    params.set('sourceCardId', card.id);
    if (card.sellerNote) params.set('note', card.sellerNote);
    router.push(`/dashboard/vendas/em-andamento?${params.toString()}`);
  };

  const openPreService = (card: FunnelCard) => {
    const interests = parseInterestPayload(card.itemInterest);
    const serviceIds = interests.filter((item) => item.type === 'SERVICE').map((item) => item.id);
    if (serviceIds.length === 0) return;
    const params = new URLSearchParams();
    params.set('customerId', card.customerId);
    params.set('serviceIds', serviceIds.join(','));
    params.set('sourceCardId', card.id);
    if (card.sellerNote) params.set('note', card.sellerNote);
    router.push(`/dashboard/os/nova?${params.toString()}`);
  };

  const openInterestEditor = (card: FunnelCard) => {
    openTransitionModal(card, 'CONTATO_QUENTE');
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      toast.error('Digite uma mensagem para enviar');
      return;
    }
    if (!selectedInteractionCard?.customerPhone) {
      toast.error('Cliente sem WhatsApp cadastrado');
      return;
    }
    setReplySending(true);
    try {
      await api.post(`/atendimento/${selectedInteractionCard.id}/send-message`, {
        message: replyMessage.trim(),
      });
      toast.success('Mensagem enviada com sucesso!');
      setReplyMessage('');
      await fetchInteractions(selectedInteractionCard.customerId);
      scrollToBottom();
    } catch {
      toast.error('Erro ao enviar mensagem. Verifique se o bot do WhatsApp está ativo.');
    } finally {
      setReplySending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendReply();
    }
  };

  const filteredInterestCandidates = useMemo(() => {
    const query = interestSearch.trim().toLowerCase();
    if (query.length < 2) {
      return [];
    }
    const products = catalogProducts
      .filter((item) => item.commercialName.toLowerCase().includes(query))
      .slice(0, 5)
      .map<InterestItem>((item) => ({
        id: item.id,
        type: 'PRODUCT',
        name: item.commercialName,
        price: Number(item.price),
      }));

    const services = catalogServices
      .filter((item) => item.name.toLowerCase().includes(query))
      .slice(0, 5)
      .map<InterestItem>((item) => ({
        id: item.id,
        type: 'SERVICE',
        name: item.name,
        price: Number(item.priceBase),
      }));

    return [...products, ...services].filter((candidate) =>
      !transitionInterestItems.some((selected) => selected.id === candidate.id && selected.type === candidate.type)
    );
  }, [interestSearch, catalogProducts, catalogServices, transitionInterestItems]);

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-300 font-orbitron">Atendimento CRM</h1>
          <p className="text-slate-400">Arraste os cards entre as etapas. A justificativa é obrigatória para mover.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => fetchCards(true)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button className="bg-cyan-400 text-slate-900 hover:bg-cyan-300" onClick={() => setNewModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Atendimento
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">Carregando funil...</div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {COLUMNS.map((column) => (
              <Column
                key={column.id}
                stage={column.id}
                title={column.title}
                cards={cardsByStage[column.id]}
                onOpenInteractions={openInteractionsModal}
                onDeleteCard={handleDeleteCard}
                onOpenPreSale={openPreSale}
                onOpenPreService={openPreService}
                onEditInterest={openInterestEditor}
                isDragOver={dragOverColumn === column.id && activeDragId !== null}
              />
            ))}
          </div>
        </DndContext>
      )}

      <Dialog open={newModalOpen} onOpenChange={setNewModalOpen}>
        <DialogContent className="max-w-xl bg-[#0f172a] border-cyan-400/20 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-gray-300">Novo Atendimento</DialogTitle>
            <DialogDescription className="text-slate-400">Cadastre um novo contato ou vincule um cliente existente.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Select label="Origem do contato" value={newCustomerType} onChange={(event) => setNewCustomerType(event.target.value as 'EXISTING' | 'NEW')} className="bg-slate-950/60 border-cyan-400/30 text-slate-200">
              <option value="EXISTING">Cliente existente</option>
              <option value="NEW">Novo contato</option>
            </Select>

            {newCustomerType === 'EXISTING' ? (
              <Select label="Cliente" value={selectedCustomerId} onChange={(event) => setSelectedCustomerId(event.target.value)} className="bg-slate-950/60 border-cyan-400/30 text-slate-200">
                <option value="">Selecione...</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </Select>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input label="Nome" value={newName} onChange={(event) => setNewName(event.target.value)} className="bg-slate-950/60 border-cyan-400/30 text-slate-200" />
                <Input label="WhatsApp" value={newWhatsapp} onChange={(event) => setNewWhatsapp(event.target.value)} className="bg-slate-950/60 border-cyan-400/30 text-slate-200" />
              </div>
            )}

            <Select label="Etapa inicial" value={newStage} onChange={(event) => setNewStage(event.target.value as FunnelStage)} className="bg-slate-950/60 border-cyan-400/30 text-slate-200">
              {COLUMNS.map((column) => (
                <option key={column.id} value={column.id}>{column.title}</option>
              ))}
            </Select>

            <Input label="Item de Interesse" value={newItemInterest} onChange={(event) => setNewItemInterest(event.target.value)} className="bg-slate-950/60 border-cyan-400/30 text-slate-200" />
            <Textarea placeholder="Observação inicial do vendedor" value={newNote} onChange={(event) => setNewNote(event.target.value)} className="bg-slate-950/60 border-cyan-400/30 text-slate-200" />
          </div>

          <DialogFooter>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setNewModalOpen(false)}>Cancelar</Button>
            <Button className="bg-cyan-400 text-slate-900 hover:bg-cyan-300" onClick={handleCreateCard}>Criar Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={transitionModalOpen} onOpenChange={setTransitionModalOpen}>
        <DialogContent className={`bg-[#0f172a] border-cyan-400/20 text-slate-100 ${
          selectedCard?.stage === 'VENDA_CONCLUIDA' && targetStage === 'FEEDBACK_REALIZADO'
            ? 'max-w-lg'
            : 'max-w-xl'
        }`}>
          <DialogHeader>
            <DialogTitle className="text-gray-300">Transição de Atendimento</DialogTitle>
            <DialogDescription className="text-slate-400">
              Movendo card para: <strong className="text-slate-200">{COLUMNS.find((c) => c.id === targetStage)?.title}</strong>
            </DialogDescription>
          </DialogHeader>

          {transitionError && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {transitionError}
            </div>
          )}

          <div className="space-y-4">
            <Select
              label="Nova etapa"
              value={targetStage}
              onChange={(event) => {
                setTargetStage(event.target.value as FunnelStage);
                setTransitionError(null);
              }}
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            >
              {COLUMNS.map((column) => (
                <option key={column.id} value={column.id}>{column.title}</option>
              ))}
            </Select>

            {selectedCard?.stage === 'NOVO_CONTATO' && targetStage === 'EM_ANDAMENTO' ? (
              <div className="rounded-lg border border-cyan-400/20 p-3 bg-slate-950/40 space-y-1 text-sm text-slate-300">
                <p><strong className="text-slate-200">Cliente:</strong> {selectedCard.customerName}</p>
                <p><strong className="text-slate-200">Telefone:</strong> {selectedCard.customerPhone || 'Sem WhatsApp cadastrado'}</p>
              </div>
            ) : null}

            {targetStage === 'CONTATO_QUENTE' ? (
              <div className="space-y-3">
                <Input
                  label="Buscar produtos e serviços"
                  placeholder="Digite pelo menos 2 letras"
                  value={interestSearch}
                  onChange={(event) => setInterestSearch(event.target.value)}
                  className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
                />
                {interestSearch.trim().length < 2 ? (
                  <p className="text-xs text-slate-500 px-1">Digite as iniciais para buscar</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto border border-cyan-400/20 rounded-lg p-2 space-y-2 bg-slate-950/40">
                    {filteredInterestCandidates.length === 0 ? (
                      <p className="text-xs text-slate-500 px-1">Nenhum item encontrado</p>
                    ) : (
                      filteredInterestCandidates.map((candidate) => (
                        <button
                          key={`${candidate.type}-${candidate.id}`}
                          type="button"
                          className="w-full text-left px-2 py-1 rounded hover:bg-slate-800/50 text-sm flex items-center justify-between text-slate-200"
                          onClick={() => addInterestItem(candidate)}
                        >
                          <span>{candidate.name}</span>
                          <Badge variant="outline" className="border-white/10 text-gray-300">{candidate.type === 'PRODUCT' ? 'Produto' : 'Serviço'}</Badge>
                        </button>
                      ))
                    )}
                  </div>
                )}
                <Input
                  label="Produtos/serviços selecionados"
                  value={formatInterestText(transitionInterestItems)}
                  readOnly
                  className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
                />
                <div className="flex flex-wrap gap-2">
                  {transitionInterestItems.map((item) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      type="button"
                      className="px-2 py-1 rounded border border-cyan-400/20 text-xs bg-slate-900/50 text-slate-200 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                      onClick={() => removeInterestItem(item)}
                    >
                      {item.name} ({item.type === 'PRODUCT' ? 'Produto' : 'Serviço'}) ×
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {(targetStage === 'CONTATO_QUENTE' || selectedCard?.stage === 'CONTATO_QUENTE') ? (
              <Textarea
                label="Observações do contato"
                placeholder="Registre as observações deste atendimento"
                value={transitionContactNote}
                onChange={(event) => {
                  setTransitionContactNote(event.target.value);
                  setTransitionError(null);
                }}
                className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
              />
            ) : null}

            {selectedCard?.stage === 'VENDA_CONCLUIDA' && targetStage === 'FEEDBACK_REALIZADO' ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
                  {loadingFeedbackPreview ? (
                    <p className="text-sm text-slate-400 text-center py-4">Carregando dados da mensagem...</p>
                  ) : feedbackPreview ? (
                    <>
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                        <span><strong className="text-slate-200">Cliente:</strong> {feedbackPreview.customerName}</span>
                      </div>
                      <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/50">
                        <p className="text-xs text-slate-500 mb-1.5 uppercase tracking-wide font-semibold">Mensagem de avaliação</p>
                        <Textarea
                          value={feedbackMessage}
                          onChange={(event) => setFeedbackMessage(event.target.value)}
                          className="bg-slate-950/80 border-slate-700/50 text-slate-200 min-h-[100px] text-sm"
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-rose-400 text-center py-2">Não foi possível carregar os dados da avaliação.</p>
                  )}
                  <label className="flex items-center gap-2 text-sm text-slate-300 bg-slate-900/40 rounded-lg p-2.5">
                    <input
                      type="checkbox"
                      checked={sendFeedbackRequest}
                      onChange={(event) => setSendFeedbackRequest(event.target.checked)}
                      className="rounded border-cyan-400/30 bg-slate-950/60 text-cyan-400"
                    />
                    Enviar solicitação de feedback para o WhatsApp do cliente
                  </label>
                </div>
              </div>
            ) : null}

            {!(selectedCard?.stage === 'NOVO_CONTATO' && targetStage === 'EM_ANDAMENTO') &&
            !(selectedCard?.stage === 'EM_ANDAMENTO' && targetStage === 'CONTATO_QUENTE') &&
            !(selectedCard?.stage === 'CONTATO_QUENTE' && targetStage === 'CONTATO_QUENTE') &&
            !(selectedCard?.stage === 'VENDA_CONCLUIDA' && targetStage === 'FEEDBACK_REALIZADO') ? (
              <Textarea
                label="Justificativa da mudança *"
                placeholder="Descreva o motivo da mudança de etapa (obrigatório)"
                value={transitionObservation}
                onChange={(event) => {
                  setTransitionObservation(event.target.value);
                  setTransitionError(null);
                }}
                className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
              />
            ) : null}

          </div>

          <DialogFooter>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setTransitionModalOpen(false)}>Cancelar</Button>
            <Button
              className={
                selectedCard?.stage === 'VENDA_CONCLUIDA' && targetStage === 'FEEDBACK_REALIZADO'
                  ? 'bg-emerald-500 text-white hover:bg-emerald-400 gap-2'
                  : 'bg-cyan-400 text-slate-900 hover:bg-cyan-300'
              }
              onClick={handleApplyTransition}
            >
              {selectedCard?.stage === 'VENDA_CONCLUIDA' && targetStage === 'FEEDBACK_REALIZADO' && sendFeedbackRequest ? (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Avaliação
                </>
              ) : 'Confirmar Transição'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={interactionsModalOpen} onOpenChange={(open) => {
        if (!open) closeInteractionsModal();
      }}>
        <DialogContent className="max-w-lg bg-[#0f172a] border-cyan-400/20 text-slate-100 h-[80vh] flex flex-col p-0 gap-0">
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-cyan-400/10">
            <div>
              <DialogTitle className="text-gray-300 text-base">
                {selectedInteractionCard?.customerName || 'Conversa'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                {selectedInteractionCard?.customerPhone || ''}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-200"
              onClick={closeInteractionsModal}
            >
              Fechar
            </Button>
          </div>

          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3
              [&::-webkit-scrollbar]:w-1.5
              [&::-webkit-scrollbar-thumb]:bg-cyan-400/20
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-track]:bg-transparent"
          >
            {interactionsLoading ? (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-cyan-400/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-cyan-400/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            ) : interactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <MessageCircle className="w-10 h-10 mb-2 text-slate-600" />
                <p className="text-sm">Nenhuma mensagem ainda.</p>
                <p className="text-xs text-slate-600">Envie uma mensagem para iniciar a conversa.</p>
              </div>
            ) : (
              interactions.map((interaction) => (
                <ChatBubble key={interaction.id} interaction={interaction} />
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-cyan-400/10 px-4 py-3">
            {!selectedInteractionCard?.customerPhone ? (
              <p className="text-sm text-rose-400 text-center py-2">
                Cliente não possui WhatsApp cadastrado
              </p>
            ) : (
              <div className="flex items-end gap-2">
                <Textarea
                  placeholder="Digite sua mensagem... (Enter para enviar)"
                  value={replyMessage}
                  onChange={(event) => setReplyMessage(event.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={replySending}
                  className="bg-slate-950/60 border-slate-700/50 text-slate-200 min-h-[44px] max-h-[120px] resize-none text-sm"
                  rows={1}
                />
                <Button
                  onClick={handleSendReply}
                  disabled={replySending || !replyMessage.trim()}
                  className="bg-cyan-500 text-white hover:bg-cyan-400 disabled:opacity-50 h-[44px] w-[44px] p-0 flex-shrink-0"
                >
                  {replySending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
