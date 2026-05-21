'use client';

/* eslint-disable security/detect-object-injection */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/native-select';
import {
    Save,
    Barcode,
    DollarSign,
    Box,
    FileText,
    Plus,
    List,
    Loader2
} from 'lucide-react';
import { api } from '@/lib/api';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Image from 'next/image';

// Interfaces
interface Category {
    id: string;
    name: string;
}

interface Manufacturer {
    id: string;
    name: string;
}

interface Supplier {
    id: string;
    name: string;
}

interface Client {
    id: string;
    name: string;
    document?: string | null;
}

interface AttributeOption {
    id: string;
    value: string;
    label: string;
    order: number;
}

interface Attribute {
    id: string;
    name: string;
    slug: string;
    type: 'TEXT' | 'NUMBER' | 'LIST' | 'BOOLEAN';
    entitySource: 'NONE' | 'MANUFACTURER' | 'SUPPLIER' | 'CATEGORY';
    marketplaceRequired: boolean;
    options?: AttributeOption[];
}

interface ProductAttribute {
    attributeId: string;
    value: string;
    attribute?: Attribute;
}

interface CosmosImportedAttribute {
    attributeId: string;
    value: string;
}

interface CosmosImportDraft {
    commercialName: string;
    barcode: string;
    ncm: string;
    shortDescription: string;
    longDescription: string;
    weight: number;
    height: number;
    width: number;
    length: number;
    categoryId: string;
    manufacturerId: string;
    attributes: CosmosImportedAttribute[];
}

interface CosmosImportData {
    exists: boolean;
    existingProduct?: {
        id: string;
        commercialName: string;
    };
    draft?: CosmosImportDraft;
    cosmos?: {
        avgPrice: number | null;
        minPrice: number | null;
        maxPrice: number | null;
        thumbnail: string | null;
        brand: string | null;
        priceText: string | null;
    };
}

interface CosmosUiData {
    avgPrice: number | null;
    minPrice: number | null;
    maxPrice: number | null;
    thumbnail: string | null;
    brand: string | null;
    priceText: string | null;
}

interface CosmosImportReport {
    importedAt: string;
    appliedFields: string[];
    preservedFields: string[];
}

function extractArray<T>(payload: unknown): T[] {
    if (Array.isArray(payload)) {
        return payload as T[];
    }
    if (payload && typeof payload === 'object' && 'data' in payload) {
        const data = (payload as { data?: unknown }).data;
        if (Array.isArray(data)) {
            return data as T[];
        }
    }
    return [];
}

function unwrapData<T>(payload: unknown): T {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        return (payload as { data: T }).data;
    }
    return payload as T;
}

export interface Product {
    id: string;
    active?: boolean;
    commercialName: string; // nome_comercial
    name?: string;
    category?: { id: string; name: string } | string;
    brand?: { id: string; name: string } | string;
    baseSku?: string;
    type?: string;
    price: number;
    costPrice: number; // In Stock table theoretically, but here for form
    stock: number;
    minStock: number;

    categoryId?: string;
    manufacturerId?: string;

    barcode?: string;
    ncm?: string;
    warrantyMonths?: number;
    unit?: string;

    shortDescription?: string;
    longDescription?: string;
    weight?: number;
    height?: number;
    width?: number;
    length?: number;
    margin?: number;
    commission?: number;

    controlSerialNumber: boolean;
    allowUsed: boolean;

    condition?: string;
    supplierId?: string | null;
    originClientId?: string | null;

    attributes?: ProductAttribute[];
}

export interface ProductFormData {
    commercialName: string;
    baseSku: string;

    categoryId: string;
    manufacturerId: string;

    price: number;
    costPrice: number;
    stock: number;
    minStock: number;

    barcode: string;
    ncm: string;
    warrantyMonths: number;
    unit: string;

    shortDescription: string;
    longDescription: string;
    weight: number;
    height: number;
    width: number;
    length: number;
    margin: number;
    commission: number;

    controlSerialNumber: boolean;
    allowUsed: boolean;

    initialStock: boolean;
    condition: string;
    supplierId: string;
    originClientId: string;

    variations: {
        id?: string;
        sku: string;
        title: string;
        basePrice: number;
        active: boolean;
    }[];

    attributes: {
        attributeId: string;
        value: string;
    }[];
}

interface ProductFormProps {
    initialData?: Partial<Product> | null;
    onSave: (data: ProductFormData) => void;
    onCancel: () => void;
}

export function ProductForm({ initialData, onSave, onCancel }: ProductFormProps) {
    // UI States
    const [showInitialStock, setShowInitialStock] = useState(false);
    const [activeTab, setActiveTab] = useState('produto');

    // Data Lists
    const [categories, setCategories] = useState<Category[]>([]);
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [attributes, setAttributes] = useState<Attribute[]>([]);

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [quickCategoryOpen, setQuickCategoryOpen] = useState(false);
    const [quickCategoryName, setQuickCategoryName] = useState('');
    const [quickManufacturerOpen, setQuickManufacturerOpen] = useState(false);
    const [quickManufacturerName, setQuickManufacturerName] = useState('');
    const [quickCategorySaving, setQuickCategorySaving] = useState(false);
    const [quickManufacturerSaving, setQuickManufacturerSaving] = useState(false);
    const [importingCosmos, setImportingCosmos] = useState(false);
    const [cosmosData, setCosmosData] = useState<CosmosUiData | null>(null);
    const [cosmosImportReport, setCosmosImportReport] = useState<CosmosImportReport | null>(null);

    // Initialize Form Data
    const [formData, setFormData] = useState<ProductFormData>({
        commercialName: initialData?.commercialName || initialData?.name || '', // Fallback to name if commercialName missing
        baseSku: initialData?.baseSku || '',

        categoryId: initialData?.categoryId || (typeof initialData?.category === 'object' ? initialData.category.id : ''),
        manufacturerId: initialData?.manufacturerId || (typeof initialData?.brand === 'object' ? initialData.brand.id : ''),

        price: Number(initialData?.price) || 0,
        costPrice: Number(initialData?.costPrice) || 0,
        stock: Number(initialData?.stock) || 0,
        minStock: Number(initialData?.minStock) || 5,

        barcode: initialData?.barcode || '',
        ncm: initialData?.ncm || '',
        warrantyMonths: Number(initialData?.warrantyMonths ?? 3),
        unit: initialData?.unit || 'UN',

        shortDescription: initialData?.shortDescription || initialData?.longDescription || '',
        longDescription: initialData?.longDescription || '',
        weight: Number(initialData?.weight) || 0,
        height: Number(initialData?.height) || 0,
        width: Number(initialData?.width) || 0,
        length: Number(initialData?.length) || 0,
        margin: Number(initialData?.margin) || 0,
        commission: Number(initialData?.commission) || 0,

        controlSerialNumber: initialData?.controlSerialNumber || false,
        allowUsed: initialData?.allowUsed ?? true,

        initialStock: false,
        condition: initialData?.condition === 'USED' ? 'Usado' : 'Novo',
        supplierId: initialData?.supplierId || '',
        originClientId: initialData?.originClientId || '',
        variations: [], // Variations loading is complex, usually handled separately or requires include
        attributes: initialData?.attributes?.map(a => ({ attributeId: a.attributeId, value: a.value })) || [],
    });

    // Fetch Initial Data
    useEffect(() => {
        const loadData = async () => {
            try {
                const [catsRes, manufsRes, suppliersRes, clientsRes, attrsRes] = await Promise.all([
                    api.get<Category[]>('/categories'),
                    api.get<Manufacturer[]>('/manufacturers'),
                    api.get<Supplier[]>('/suppliers'),
                    api.get<Client[]>('/clients'),
                    api.get<Attribute[]>('/attributes')
                ]);
                setCategories(extractArray<Category>(catsRes.data));
                setManufacturers(extractArray<Manufacturer>(manufsRes.data));
                setSuppliers(extractArray<Supplier>(suppliersRes.data));
                setClients(extractArray<Client>(clientsRes.data));
                setAttributes(extractArray<Attribute>(attrsRes.data));
            } catch (error) {
                console.error('Failed to load form data', error);
            }
        };
        loadData();
    }, []);
    const metadataSlugs = new Set([
        'integracao-origem',
        'integracao-sincronizado-em',
        'integracao-payload-cosmos',
        'imagem-produto',
        'marca-imagem',
        'preco-medio-cosmos',
        'preco-maximo-cosmos',
        'preco-minimo-cosmos',
        'preco-texto-cosmos'
    ]);
    const technicalAttributes = attributes.filter((attr) => !attr.slug.startsWith('integracao-') && !metadataSlugs.has(attr.slug) && attr.slug !== 'garantia');
    const integrationAttributes = attributes.filter((attr) => attr.slug.startsWith('integracao-') || metadataSlugs.has(attr.slug));

    // Attribute Logic
    useEffect(() => {
        setFormData(prev => {
            const newAttributes = [...prev.attributes];
            let changed = false;

            attributes.forEach(attr => {
                if (attr.entitySource && attr.entitySource !== 'NONE') {
                    // Skip automatic filling for Supplier if we are in "Client Mode" (Condição = Usado)
                    // We identify "Client Mode" by checking if originClientId is set, or if the "Condição" attribute says "Usado"
                    // But here we don't have easy access to "Condição" attribute value inside this loop easily without looking it up.
                    
                    const condicaoAttr = attributes.find(a => a.name === 'Condição' || a.slug === 'condicao');
                    const condicaoValue = condicaoAttr ? (newAttributes.find(a => a.attributeId === condicaoAttr.id)?.value || '') : '';
                    
                    if (attr.entitySource === 'SUPPLIER' && condicaoValue === 'Usado') {
                         return; // Don't auto-fill Supplier if Used
                    }

                    let value = '';
                    if (attr.entitySource === 'MANUFACTURER' && formData.manufacturerId) {
                        value = manufacturers.find(m => m.id === formData.manufacturerId)?.name || '';
                    } else if (attr.entitySource === 'CATEGORY' && formData.categoryId) {
                        value = categories.find(c => c.id === formData.categoryId)?.name || '';
                    } else if (attr.entitySource === 'SUPPLIER' && formData.supplierId) {
                        value = suppliers.find(s => s.id === formData.supplierId)?.name || '';
                    }

                    if (value) {
                        const existingIndex = newAttributes.findIndex(a => a.attributeId === attr.id);
                        if (existingIndex >= 0) {
                            if (newAttributes[existingIndex].value !== value) {
                                newAttributes[existingIndex] = { ...newAttributes[existingIndex], value };
                                changed = true;
                            }
                        } else {
                            newAttributes.push({ attributeId: attr.id, value });
                            changed = true;
                        }
                    }
                }
            });

            if (!changed) {
                return prev;
            }

            return { ...prev, attributes: newAttributes };
        });
    }, [formData.manufacturerId, formData.categoryId, formData.supplierId, attributes, manufacturers, categories, suppliers]);

    useEffect(() => {
        const garantiaAttr = attributes.find((attr) => attr.slug === 'garantia');
        if (!garantiaAttr) return;
        setFormData((prev) => {
            const newAttributes = [...prev.attributes];
            const value = String(Math.max(0, Math.trunc(prev.warrantyMonths || 0)));
            const index = newAttributes.findIndex((item) => item.attributeId === garantiaAttr.id);
            if (index >= 0) {
                if (newAttributes[index].value === value) return prev;
                newAttributes[index] = { ...newAttributes[index], value };
                return { ...prev, attributes: newAttributes };
            }
            newAttributes.push({ attributeId: garantiaAttr.id, value });
            return { ...prev, attributes: newAttributes };
        });
    }, [attributes, formData.warrantyMonths]);

    const handleAttributeChange = (attributeId: string, value: string) => {
        setFormData(prev => {
            const newAttributes = [...prev.attributes];
            const index = newAttributes.findIndex(a => a.attributeId === attributeId);
            
            // Special Logic for "Fornecedor" attribute change
            const attr = attributes.find(a => a.id === attributeId);
            if (attr?.slug === 'garantia') {
                const parsedWarranty = parseInt(value, 10);
                return {
                    ...prev,
                    warrantyMonths: Number.isFinite(parsedWarranty) ? Math.max(0, parsedWarranty) : 0,
                    attributes: index >= 0
                        ? newAttributes.map((a, i) => i === index ? { ...a, value } : a)
                        : [...newAttributes, { attributeId, value }]
                };
            }
            if (attr && (attr.name === 'Fornecedor' || attr.slug === 'fornecedor')) {
                 // Find if we are in 'Novo' or 'Usado' mode
                 const condicaoAttr = attributes.find(a => a.name === 'Condição' || a.slug === 'condicao');
                 const condicaoValue = condicaoAttr ? (newAttributes.find(a => a.attributeId === condicaoAttr.id)?.value || '') : '';
                 
                 if (condicaoValue === 'Usado') {
                     // It's a Client
                     
                     // If I make value={name}, then:
                     const client = clients.find(c => c.name === value);
                     if (client) {
                         return { 
                             ...prev, 
                             originClientId: client.id, 
                             supplierId: '', 
                             attributes: index >= 0 
                                 ? newAttributes.map((a, i) => i === index ? { ...a, value } : a) 
                                 : [...newAttributes, { attributeId, value }]
                         };
                     }
                 } else {
                     // It's a Supplier
                     const supplier = suppliers.find(s => s.name === value);
                     if (supplier) {
                          return { 
                             ...prev, 
                             supplierId: supplier.id, 
                             originClientId: '', 
                             attributes: index >= 0 
                                 ? newAttributes.map((a, i) => i === index ? { ...a, value } : a) 
                                 : [...newAttributes, { attributeId, value }]
                         };
                     }
                 }
            }

            if (index >= 0) {
                newAttributes[index] = { ...newAttributes[index], value };
            } else {
                newAttributes.push({ attributeId, value });
            }
            return { ...prev, attributes: newAttributes };
        });
    };

    const getAttributeValue = (attributeId: string) => {
        return formData.attributes.find(a => a.attributeId === attributeId)?.value || '';
    };

    // Handlers
    const handleChange = <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
        setFormData(prev => {
            return { ...prev, [field]: value };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const commercialName = formData.commercialName.trim();
        if (!commercialName || commercialName.length < 3) {
            setActiveTab('produto');
            toast.error('Nome comercial deve ter pelo menos 3 caracteres');
            return;
        }
        const barcode = formData.barcode.trim();
        if (!barcode) {
            setActiveTab('produto');
            toast.error('Código de barras é obrigatório');
            return;
        }
        if (!formData.manufacturerId) {
            setActiveTab('produto');
            toast.error('Selecione um fabricante');
            return;
        }
        const normalizeNumber = (value: number, fallback: number) =>
            Number.isFinite(value) ? value : fallback;

        const payload: ProductFormData = {
            ...formData,
            commercialName,
            baseSku: formData.baseSku.trim(),
            barcode,
            ncm: formData.ncm.trim(),
            shortDescription: formData.shortDescription.trim(),
            longDescription: formData.longDescription.trim(),
            price: normalizeNumber(formData.price, 0),
            costPrice: normalizeNumber(formData.costPrice, 0),
            stock: normalizeNumber(formData.stock, 0),
            minStock: normalizeNumber(formData.minStock, 5),
            margin: normalizeNumber(formData.margin, 0),
            commission: normalizeNumber(formData.commission, 0),
            warrantyMonths: Math.max(0, Math.trunc(normalizeNumber(formData.warrantyMonths, 0))),
            weight: normalizeNumber(formData.weight, 0),
            height: normalizeNumber(formData.height, 0),
            width: normalizeNumber(formData.width, 0),
            length: normalizeNumber(formData.length, 0),
            initialStock: showInitialStock
        };

        onSave(payload);
    };

    const generateBarcode = () => {
        const code = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
        handleChange('barcode', code);
    };

    const mergeImportedAttributes = (
        current: ProductFormData['attributes'],
        imported: ProductFormData['attributes']
    ): ProductFormData['attributes'] => {
        const merged = [...current];
        imported.forEach((item) => {
            const index = merged.findIndex((attr) => attr.attributeId === item.attributeId);
            if (index >= 0) {
                if (!merged[index].value) {
                    merged[index] = item;
                }
                return;
            }
            merged.push(item);
        });
        return merged;
    };

    const formatMoney = (value: number) =>
        value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const applyCosmosPrice = (field: 'price' | 'costPrice', value: number | null) => {
        if (value === null || value === undefined) {
            toast.error('Valor da Cosmos indisponível');
            return;
        }
        handleChange(field, value);
        toast.success(field === 'price' ? 'Preço de venda atualizado com a Cosmos' : 'Preço de custo atualizado com a Cosmos');
    };

    const importFromCosmos = async () => {
        const barcode = formData.barcode.trim();
        if (!barcode) {
            toast.error('Informe o código de barras');
            return;
        }

        setImportingCosmos(true);
        try {
            const response = await api.post('/integrations/cosmos/import-by-barcode', {
                barcode,
                categoryId: formData.categoryId || undefined
            });
            const result = unwrapData<CosmosImportData>(response.data);

            if (result.exists) {
                toast.error(`Já existe produto ativo com esse código: ${result.existingProduct?.commercialName || ''}`);
                return;
            }

            if (!result.draft) {
                toast.error('Não foi possível importar os dados');
                return;
            }

            const draft = result.draft;
            const appliedFields: string[] = [];
            const preservedFields: string[] = [];
            setFormData((prev) => {
                const next = {
                    ...prev,
                    barcode: draft.barcode || prev.barcode,
                    commercialName: prev.commercialName || draft.commercialName,
                    shortDescription: prev.shortDescription || draft.shortDescription,
                    longDescription: prev.longDescription || draft.longDescription,
                    ncm: prev.ncm || draft.ncm,
                    weight: prev.weight > 0 ? prev.weight : draft.weight,
                    height: prev.height > 0 ? prev.height : draft.height,
                    width: prev.width > 0 ? prev.width : draft.width,
                    length: prev.length > 0 ? prev.length : draft.length,
                    categoryId: prev.categoryId || draft.categoryId,
                    manufacturerId: prev.manufacturerId || draft.manufacturerId,
                    price: prev.price > 0 || result.cosmos?.avgPrice === null || result.cosmos?.avgPrice === undefined ? prev.price : result.cosmos.avgPrice,
                    costPrice: prev.costPrice > 0 || result.cosmos?.minPrice === null || result.cosmos?.minPrice === undefined ? prev.costPrice : result.cosmos.minPrice,
                    attributes: mergeImportedAttributes(prev.attributes, draft.attributes),
                };

                const monitoredFields: Array<{
                    label: string;
                    before: string | number;
                    after: string | number;
                }> = [
                    { label: 'Código de Barras', before: prev.barcode, after: next.barcode },
                    { label: 'Nome Comercial', before: prev.commercialName, after: next.commercialName },
                    { label: 'Descrição Curta', before: prev.shortDescription, after: next.shortDescription },
                    { label: 'Descrição Longa', before: prev.longDescription, after: next.longDescription },
                    { label: 'NCM', before: prev.ncm, after: next.ncm },
                    { label: 'Peso', before: prev.weight, after: next.weight },
                    { label: 'Altura', before: prev.height, after: next.height },
                    { label: 'Largura', before: prev.width, after: next.width },
                    { label: 'Comprimento', before: prev.length, after: next.length },
                    { label: 'Categoria', before: prev.categoryId, after: next.categoryId },
                    { label: 'Fabricante', before: prev.manufacturerId, after: next.manufacturerId },
                    { label: 'Preço de Venda', before: prev.price, after: next.price },
                    { label: 'Preço de Custo', before: prev.costPrice, after: next.costPrice },
                ];

                monitoredFields.forEach((field) => {
                    if (field.before !== field.after) {
                        appliedFields.push(field.label);
                    } else {
                        preservedFields.push(field.label);
                    }
                });

                return next;
            });

            if (result.cosmos) {
                setCosmosData({
                    avgPrice: result.cosmos.avgPrice,
                    minPrice: result.cosmos.minPrice,
                    maxPrice: result.cosmos.maxPrice,
                    thumbnail: result.cosmos.thumbnail,
                    brand: result.cosmos.brand,
                    priceText: result.cosmos.priceText
                });
            } else {
                setCosmosData(null);
            }
            setCosmosImportReport({
                importedAt: new Date().toISOString(),
                appliedFields,
                preservedFields
            });

            if (result.cosmos?.avgPrice !== null && result.cosmos?.avgPrice !== undefined) {
                toast.success(`Importação concluída. Preço médio Cosmos: R$ ${result.cosmos.avgPrice.toFixed(2)}`);
            } else {
                toast.success('Importação concluída');
            }
            setActiveTab('produto');
        } catch (error) {
            const serverMessage = (
                error as {
                    response?: {
                        data?: {
                            error?: string;
                        };
                    };
                }
            )?.response?.data?.error;
            const message = serverMessage || (error instanceof Error ? error.message : 'Erro ao importar da Cosmos');
            toast.error(message);
        } finally {
            setImportingCosmos(false);
        }
    };

    const generateTitle = () => {
        const category = categories.find(c => c.id === formData.categoryId)?.name || '';
        const manufacturer = manufacturers.find(m => m.id === formData.manufacturerId)?.name || '';

        const resolveAttributeValue = (matchers: string[]) => {
            const attribute = attributes.find((a) => {
                const normalizedName = a.name.toLowerCase();
                const normalizedSlug = a.slug.toLowerCase();
                return matchers.some((matcher) => normalizedName.includes(matcher) || normalizedSlug.includes(matcher));
            });
            if (!attribute) return '';
            return getAttributeValue(attribute.id) || '';
        };

        const detalhe = resolveAttributeValue(['detalhe', 'descricao', 'descrição']);
        const memoria = resolveAttributeValue(['memoria', 'memória', 'ram']);
        const armazenamento = resolveAttributeValue(['armazenamento', 'storage', 'capacidade']);
        const cor = resolveAttributeValue(['cor', 'color']);
        const condicaoAtributo = resolveAttributeValue(['condicao', 'condição']);
        const condicao = formData.condition || condicaoAtributo;

        const orderedParts = [
            category,
            manufacturer,
            detalhe,
            memoria,
            armazenamento,
            cor,
            condicao
        ].filter((part) => part && part.trim().length > 0);

        handleChange('commercialName', orderedParts.join(' ').trim());
    };

    const handleCreateManufacturer = async () => {
        const name = quickManufacturerName.trim();
        if (!name) {
            toast.error('Informe o nome do fabricante');
            return;
        }
        setQuickManufacturerSaving(true);
        try {
            const response = await api.post('/manufacturers', { name, active: true });
            const savedItem = unwrapData<Manufacturer>(response.data);
            setManufacturers(prev => [...prev, savedItem]);
            handleChange('manufacturerId', savedItem.id);
            setQuickManufacturerOpen(false);
            setQuickManufacturerName('');
            toast.success('Fabricante criado com sucesso!');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao criar fabricante';
            toast.error(message);
        } finally {
            setQuickManufacturerSaving(false);
        }
    };

    const handleCreateCategory = async () => {
        const name = quickCategoryName.trim();
        if (!name) {
            toast.error('Informe o nome da categoria');
            return;
        }
        setQuickCategorySaving(true);
        try {
            const response = await api.post('/categories', { name, active: true });
            const savedItem = unwrapData<Category>(response.data);
            setCategories(prev => [...prev, savedItem]);
            handleChange('categoryId', savedItem.id);
            setQuickCategoryOpen(false);
            setQuickCategoryName('');
            toast.success('Categoria criada com sucesso!');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao criar categoria';
            toast.error(message);
        } finally {
            setQuickCategorySaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#0f172a] p-4 rounded-xl border border-cyan-400/20">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-cyan-300">
                        {initialData && initialData.id ? 'Editar Produto' : 'Novo Produto'}
                    </h3>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="produto" className="space-y-4">
                    <TabsList className="flex w-full justify-start bg-slate-900/70 border border-cyan-400/20 overflow-x-auto">
                        <TabsTrigger type="button" value="produto" className="min-w-[100px] text-center">Produto</TabsTrigger>
                        <TabsTrigger type="button" value="especificacoes" className="min-w-[120px] text-center">Especificações</TabsTrigger>
                        <TabsTrigger type="button" value="comercial" className="min-w-[100px] text-center">Comercial</TabsTrigger>
                        <TabsTrigger type="button" value="estoque" className="min-w-[100px] text-center">Estoque</TabsTrigger>
                    </TabsList>

                    <TabsContent value="produto">
                        <div className="space-y-6">
                            <div className="bg-[#0f172a] border border-cyan-400/20 p-6 rounded-xl space-y-4">
                                <div className="flex items-center gap-2 mb-2 text-cyan-300">
                                    <FileText className="w-5 h-5" />
                                    <h4 className="font-bold">Identificação</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-cyan-300/70 uppercase">Categoria *</label>
                                        <div className="flex gap-2 mt-1">
                                            <Select
                                                className="flex h-12 w-full rounded-md border border-cyan-400/20 bg-slate-950/60 px-3 py-2 text-sm text-slate-300 focus:border-cyan-400 outline-none appearance-none"
                                                value={formData.categoryId}
                                                onChange={(e) => handleChange('categoryId', e.target.value)}
                                                required
                                            >
                                                <option value="">Selecione...</option>
                                                {categories.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </Select>
                                            <Button type="button" size="icon" className="shrink-0" onClick={() => setQuickCategoryOpen(true)}>
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-cyan-300/70 uppercase">Fabricante *</label>
                                        <div className="flex gap-2 mt-1">
                                            <Select
                                                className="flex h-12 w-full rounded-md border border-cyan-400/20 bg-slate-950/60 px-3 py-2 text-sm text-slate-300 focus:border-cyan-400 outline-none appearance-none"
                                                value={formData.manufacturerId}
                                                onChange={(e) => handleChange('manufacturerId', e.target.value)}
                                                required
                                            >
                                                <option value="">Selecione...</option>
                                                {manufacturers.map(m => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </Select>
                                            <Button type="button" size="icon" className="shrink-0" onClick={() => setQuickManufacturerOpen(true)}>
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-cyan-300/70 uppercase">Cód. Barras *</label>
                                        <div className="flex gap-2 mt-1">
                                            <Input
                                                className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                                                value={formData.barcode}
                                                onChange={(e) => handleChange('barcode', e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        importFromCosmos();
                                                    }
                                                }}
                                                placeholder="EAN-13"
                                                required
                                            />
                                            <Button
                                                type="button"
                                                onClick={importFromCosmos}
                                                variant="outline"
                                                disabled={importingCosmos}
                                                className="shrink-0 border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10"
                                            >
                                                {importingCosmos ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Importar API'}
                                            </Button>
                                            <Button type="button" size="icon" onClick={generateBarcode} title="Gerar código" className="shrink-0 bg-slate-800 text-cyan-300 hover:bg-slate-700 border border-cyan-400/20">
                                                <Barcode className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-cyan-300/70 uppercase">Nome Comercial *</label>
                                        <div className="flex gap-2 mt-1">
                                            <Input
                                                className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                                                value={formData.commercialName}
                                                onChange={(e) => handleChange('commercialName', e.target.value)}
                                                placeholder="Ex: PlayStation 5 Slim 1TB Edição Digital"
                                                required
                                            />
                                            <Button type="button" onClick={generateTitle} variant="outline" title="Gerar Título Sugerido" className="border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10">
                                                Gerar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {cosmosData && (
                                <div className="bg-[#0f172a] border border-cyan-400/20 p-6 rounded-xl space-y-4">
                                    <h4 className="font-bold text-cyan-300">Dados importados da API</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2 text-sm">
                                            <p><span className="text-cyan-300/70">Marca:</span> <span className="text-slate-300">{cosmosData.brand || '—'}</span></p>
                                            <p><span className="text-cyan-300/70">Preço médio:</span> <span className="text-slate-300">{cosmosData.avgPrice !== null ? formatMoney(cosmosData.avgPrice) : '—'}</span></p>
                                            <p><span className="text-cyan-300/70">Preço mínimo:</span> <span className="text-slate-300">{cosmosData.minPrice !== null ? formatMoney(cosmosData.minPrice) : '—'}</span></p>
                                            <p><span className="text-cyan-300/70">Preço máximo:</span> <span className="text-slate-300">{cosmosData.maxPrice !== null ? formatMoney(cosmosData.maxPrice) : '—'}</span></p>
                                            <p><span className="text-cyan-300/70">Preço texto:</span> <span className="text-slate-300">{cosmosData.priceText || '—'}</span></p>
                                        </div>
                                        <div className="flex items-start justify-start md:justify-end">
                                            {cosmosData.thumbnail ? (
                                                <Image
                                                    src={cosmosData.thumbnail}
                                                    alt="Imagem importada da Cosmos"
                                                    width={112}
                                                    height={112}
                                                    unoptimized
                                                    className="h-28 w-28 rounded-md border border-cyan-400/20 object-cover"
                                                />
                                            ) : (
                                                <div className="h-28 w-28 rounded-md border border-cyan-400/20 grid place-items-center text-xs text-slate-500 bg-slate-950/60">
                                                    Sem imagem
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10"
                                            onClick={() => applyCosmosPrice('price', cosmosData.avgPrice)}
                                            disabled={cosmosData.avgPrice === null}
                                        >
                                            Aplicar preço médio
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10"
                                            onClick={() => applyCosmosPrice('costPrice', cosmosData.minPrice)}
                                            disabled={cosmosData.minPrice === null}
                                        >
                                            Aplicar mínimo no custo
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10"
                                            onClick={() => applyCosmosPrice('price', cosmosData.maxPrice)}
                                            disabled={cosmosData.maxPrice === null}
                                        >
                                            Aplicar máximo na venda
                                        </Button>
                                    </div>
                                    {cosmosImportReport && (
                                        <div className="rounded-md border border-cyan-400/20 bg-slate-950/60 p-3 text-xs space-y-2">
                                            <p className="text-slate-300">Importado em: {new Date(cosmosImportReport.importedAt).toLocaleString('pt-BR')}</p>
                                            <p><span className="text-green-400">Campos aplicados:</span> <span className="text-slate-300">{cosmosImportReport.appliedFields.join(', ') || 'nenhum'}</span></p>
                                            <p><span className="text-yellow-300">Campos preservados:</span> <span className="text-slate-300">{cosmosImportReport.preservedFields.join(', ') || 'nenhum'}</span></p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </TabsContent>

                    <TabsContent value="especificacoes">
                        <div className="space-y-6">
                            <div className="bg-[#0f172a] border border-cyan-400/20 p-6 rounded-xl space-y-4">
                                <div className="flex items-center gap-2 mb-2 text-cyan-300">
                                    <Box className="w-5 h-5" />
                                    <h4 className="font-bold">Especificações Técnicas</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-cyan-300/70 uppercase">Descrição Curta</label>
                                        <Input
                                            className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400 mt-1"
                                            value={formData.shortDescription}
                                            onChange={(e) => handleChange('shortDescription', e.target.value)}
                                            placeholder="Descrição do produto"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-cyan-300/70 uppercase">Descrição Longa</label>
                                        <Input
                                            className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400 mt-1"
                                            value={formData.longDescription}
                                            onChange={(e) => handleChange('longDescription', e.target.value)}
                                            placeholder="Detalhamento completo do produto"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-cyan-300/70 uppercase">NCM</label>
                                        <Input
                                            className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400 mt-1"
                                            value={formData.ncm}
                                            onChange={(e) => handleChange('ncm', e.target.value)}
                                            placeholder="0000.00.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-cyan-300/70 uppercase">Unidade</label>
                                        <Input
                                            className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400 mt-1"
                                            value={formData.unit}
                                            onChange={(e) => handleChange('unit', e.target.value)}
                                            placeholder="UN"
                                        />
                                    </div>

                                    <div className="col-span-2 grid grid-cols-4 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-cyan-300/70 uppercase">Peso (kg)</label>
                                            <Input
                                                className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400 mt-1"
                                                type="number"
                                                step="0.001"
                                                value={formData.weight}
                                                onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-cyan-300/70 uppercase">Altura (cm)</label>
                                            <Input
                                                className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400 mt-1"
                                                type="number"
                                                step="0.01"
                                                value={formData.height}
                                                onChange={(e) => handleChange('height', parseFloat(e.target.value))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-cyan-300/70 uppercase">Largura (cm)</label>
                                            <Input
                                                className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400 mt-1"
                                                type="number"
                                                step="0.01"
                                                value={formData.width}
                                                onChange={(e) => handleChange('width', parseFloat(e.target.value))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-cyan-300/70 uppercase">Comp. (cm)</label>
                                            <Input
                                                className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400 mt-1"
                                                type="number"
                                                step="0.01"
                                                value={formData.length}
                                                onChange={(e) => handleChange('length', parseFloat(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#0f172a] border border-cyan-400/20 p-6 rounded-xl space-y-4">
                                <div className="flex items-center gap-2 mb-2 text-cyan-300">
                                    <List className="w-5 h-5" />
                                    <h4 className="font-bold">Atributos do Produto</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-cyan-300/70 uppercase">Garantia (meses)</label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={formData.warrantyMonths}
                                            onChange={(e) => handleChange('warrantyMonths', parseInt(e.target.value) || 0)}
                                            className="mt-1 bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                                            placeholder="Ex: 3"
                                        />
                                    </div>
                                    {technicalAttributes.map(attr => {
                                        const isFornecedor = attr.name === 'Fornecedor' || attr.slug === 'fornecedor';
                                        if (isFornecedor) {
                                            const condicaoAttr = technicalAttributes.find(a => a.name === 'Condição' || a.slug === 'condicao');
                                            const condicaoValue = condicaoAttr ? getAttributeValue(condicaoAttr.id) : '';
                                            const isUsado = condicaoValue === 'Usado';
                                            return (
                                                <div key={attr.id}>
                                                    <label className="text-xs font-bold text-cyan-300/70 uppercase flex items-center gap-1">
                                                        {attr.name}
                                                        {attr.marketplaceRequired && <span className="text-red-500">*</span>}
                                                        <span className="text-[10px] text-cyan-400 border border-cyan-400/30 px-1 rounded ml-1">
                                                            {isUsado ? 'Lista: Clientes' : 'Lista: Fornecedores'}
                                                        </span>
                                                    </label>
                                                    <Select
                                                        className="flex h-10 w-full mt-1 rounded-md border border-cyan-400/20 bg-slate-950/60 px-3 py-2 text-sm text-slate-300 focus:border-cyan-400 outline-none appearance-none"
                                                        value={getAttributeValue(attr.id)}
                                                        onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                                                    >
                                                        <option value="">Selecione...</option>
                                                        {isUsado ? (
                                                            clients.map(c => (
                                                                <option key={c.id} value={c.name}>{c.name} {c.document ? `(${c.document})` : ''}</option>
                                                            ))
                                                        ) : (
                                                            suppliers.map(s => (
                                                                <option key={s.id} value={s.name}>{s.name}</option>
                                                            ))
                                                        )}
                                                    </Select>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={attr.id}>
                                                <label className="text-xs font-bold text-cyan-300/70 uppercase flex items-center gap-1">
                                                    {attr.name}
                                                    {attr.marketplaceRequired && <span className="text-red-500">*</span>}
                                                    {attr.entitySource && attr.entitySource !== 'NONE' && (
                                                        <span className="text-[10px] text-cyan-400 border border-cyan-400/30 px-1 rounded ml-1">
                                                            Auto: {attr.entitySource}
                                                        </span>
                                                    )}
                                                </label>
                                                {attr.type === 'BOOLEAN' ? (
                                                    <Select
                                                        className="flex h-10 w-full mt-1 rounded-md border border-cyan-400/20 bg-slate-950/60 px-3 py-2 text-sm text-slate-300 focus:border-cyan-400 outline-none appearance-none disabled:opacity-50"
                                                        value={getAttributeValue(attr.id)}
                                                        onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                                                        disabled={!!attr.entitySource && attr.entitySource !== 'NONE'}
                                                    >
                                                        <option value="">Selecione...</option>
                                                        <option value="true">Sim</option>
                                                        <option value="false">Não</option>
                                                    </Select>
                                                ) : attr.type === 'LIST' ? (
                                                    <Select
                                                        className="flex h-10 w-full mt-1 rounded-md border border-cyan-400/20 bg-slate-950/60 px-3 py-2 text-sm text-slate-300 focus:border-cyan-400 outline-none appearance-none disabled:opacity-50"
                                                        value={getAttributeValue(attr.id)}
                                                        onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                                                        disabled={!!attr.entitySource && attr.entitySource !== 'NONE'}
                                                    >
                                                        <option value="">Selecione...</option>
                                                        {attr.options?.map(opt => (
                                                            <option key={opt.id || opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </Select>
                                                ) : (
                                                    <Input
                                                        value={getAttributeValue(attr.id)}
                                                        onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                                                        className="mt-1 disabled:opacity-50 bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                                                        disabled={!!attr.entitySource && attr.entitySource !== 'NONE'}
                                                        placeholder={attr.entitySource && attr.entitySource !== 'NONE' ? '(Automático)' : ''}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                    {technicalAttributes.length === 0 && (
                                        <p className="col-span-2 text-sm text-gray-400 italic">
                                            Nenhum atributo técnico disponível para edição.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {integrationAttributes.length > 0 && (
                                <div className="bg-[#0f172a] border border-cyan-400/20 p-6 rounded-xl space-y-4">
                                    <div className="flex items-center gap-2 mb-2 text-cyan-300">
                                        <FileText className="w-5 h-5" />
                                        <h4 className="font-bold">Metadados de Integração</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {integrationAttributes.map((attr) => (
                                            <div key={attr.id}>
                                                <label className="text-xs font-bold text-cyan-300/70 uppercase">{attr.name}</label>
                                                <Input
                                                    value={getAttributeValue(attr.id)}
                                                    className="mt-1 bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                                                    disabled
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="comercial">
                        <div className="space-y-6">
                            <div className="bg-[#0f172a] border border-cyan-400/20 p-6 rounded-xl space-y-4">
                                <div className="flex items-center gap-2 mb-2 text-cyan-300">
                                    <DollarSign className="w-5 h-5" />
                                    <h4 className="font-bold">Preço e Margens</h4>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-cyan-300/70 uppercase">Preço Venda *</label>
                                        <div className="relative mt-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300/50 font-bold">R$</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                                                className="pl-9 text-cyan-300 font-bold bg-slate-950/60 border-cyan-400/20 focus:border-cyan-400"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-cyan-300/70 uppercase">Preço de Custo</label>
                                        <div className="relative mt-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300/50 font-bold">R$</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.costPrice}
                                                onChange={(e) => handleChange('costPrice', parseFloat(e.target.value))}
                                                className="pl-9 bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="estoque">
                        <div className="space-y-6">
                            <div className="bg-[#0f172a] border border-cyan-400/20 p-6 rounded-xl space-y-4">
                                <div className="flex items-center gap-2 mb-2 text-cyan-300">
                                    <Box className="w-5 h-5" />
                                    <h4 className="font-bold">Estoque e Movimentação</h4>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-cyan-300/70 uppercase">Estoque Mínimo</label>
                                        <Input
                                            type="number"
                                            value={formData.minStock}
                                            onChange={(e) => handleChange('minStock', parseInt(e.target.value))}
                                            className="mt-1 bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                                        />
                                    </div>

                                    {!(initialData && initialData.id) && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-cyan-300/70 uppercase">Lançar Estoque Inicial?</label>
                                            <div className="flex items-center space-x-2 border border-cyan-400/20 p-2 rounded-lg bg-slate-950/60 h-10">
                                                <input
                                                    type="checkbox"
                                                    id="showInitialStock"
                                                    checked={showInitialStock}
                                                    onChange={(e) => setShowInitialStock(e.target.checked)}
                                                    className="rounded border-cyan-400/20 text-cyan-400 focus:ring-cyan-400 bg-slate-900"
                                                />
                                                <Label htmlFor="showInitialStock" className="cursor-pointer text-xs text-slate-300">Sim</Label>
                                            </div>
                                        </div>
                                    )}

                                    {showInitialStock && (
                                        <div className="col-span-2">
                                            <label className="text-xs font-bold text-cyan-300/70 uppercase">Quantidade Inicial</label>
                                            <Input
                                                type="number"
                                                value={formData.stock}
                                                onChange={(e) => handleChange('stock', parseInt(e.target.value))}
                                                className="mt-1 bg-slate-950/60 border-cyan-400/50 text-slate-300 focus:border-cyan-400"
                                                autoFocus
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                </Tabs>

                <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" variant="ghost" onClick={onCancel} className="text-cyan-300/70 hover:text-cyan-300 hover:bg-cyan-400/10">
                        Cancelar
                    </Button>
                    <Button type="submit" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-bold">
                        <Save className="w-4 h-4 mr-2" /> Salvar Produto
                    </Button>
                </div>
            </form>

            <Dialog open={quickManufacturerOpen} onOpenChange={setQuickManufacturerOpen}>
                <DialogContent className="bg-[#0f172a] border-cyan-400/20 text-slate-300">
                    <DialogHeader>
                        <DialogTitle className="text-cyan-300">Novo Fabricante</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="quick-manufacturer-name" className="text-cyan-300/70">Nome</Label>
                        <Input
                            id="quick-manufacturer-name"
                            value={quickManufacturerName}
                            onChange={(e) => setQuickManufacturerName(e.target.value)}
                            className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setQuickManufacturerOpen(false)} className="border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10">
                            Cancelar
                        </Button>
                        <Button type="button" onClick={handleCreateManufacturer} disabled={quickManufacturerSaving} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-bold">
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={quickCategoryOpen} onOpenChange={setQuickCategoryOpen}>
                <DialogContent className="bg-[#0f172a] border-cyan-400/20 text-slate-300">
                    <DialogHeader>
                        <DialogTitle className="text-cyan-300">Nova Categoria</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="quick-category-name" className="text-cyan-300/70">Nome</Label>
                        <Input
                            id="quick-category-name"
                            value={quickCategoryName}
                            onChange={(e) => setQuickCategoryName(e.target.value)}
                            className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setQuickCategoryOpen(false)} className="border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10">
                            Cancelar
                        </Button>
                        <Button type="button" onClick={handleCreateCategory} disabled={quickCategorySaving} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-bold">
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
