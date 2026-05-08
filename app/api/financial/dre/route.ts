import { NextRequest } from 'next/server';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';


export const dynamic = 'force-dynamic';

type DreLine = {
  key: string;
  label: string;
  value: number;
  percentOfNetRevenue: number;
  isSubtotal: boolean;
  details: Array<{
    label: string;
    value: number;
  }>;
};

const monthNamePtBR = (month: number) => {
  const formatter = new Intl.DateTimeFormat('pt-BR', { month: 'long' });
  return formatter.format(new Date(2025, month - 1, 1));
};

const classifyPayable = (description: string, costCenterName: string) => {
  const source = `${description} ${costCenterName}`.toLowerCase();
  const marketingTokens = ['marketing', 'tráfego', 'trafego', 'ads', 'anúncio', 'anuncio', 'meta', 'google', 'campanha'];
  const financialTokens = ['juros', 'multa', 'tarifa', 'banco', 'financeiro', 'maquininha', 'iof', 'encargo'];

  if (marketingTokens.some((token) => source.includes(token))) return 'MARKETING';
  if (financialTokens.some((token) => source.includes(token))) return 'FINANCIAL';
  return 'ADMIN';
};

const toDateBoundaries = (month: number, year: number) => {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

const safeNumber = (value: number) => Number(value.toFixed(2));

const calcPercentOfNet = (value: number, netRevenue: number) =>
  netRevenue > 0 ? safeNumber((Math.abs(value) / netRevenue) * 100) : 0;

export async function GET(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const monthRaw = Number(searchParams.get('month') || now.getMonth() + 1);
    const yearRaw = Number(searchParams.get('year') || now.getFullYear());
    const month = Number.isFinite(monthRaw) && monthRaw >= 1 && monthRaw <= 12 ? monthRaw : now.getMonth() + 1;
    const year = Number.isFinite(yearRaw) && yearRaw >= 2020 && yearRaw <= 2100 ? yearRaw : now.getFullYear();
    const { start, end } = toDateBoundaries(month, year);

    const [sales, receivablesWithFees, serviceReceivables, commissionProvisions, payables] = await Promise.all([
      prisma.sale.findMany({
        where: {
          status: 'COMPLETED',
          date: { gte: start, lte: end },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  commercialName: true,
                },
              },
            },
          },
        },
      }),
      prisma.receivable.findMany({
        where: {
          origin: { in: ['SALE', 'SERVICE'] },
          status: 'PAID',
          paidAt: { gte: start, lte: end },
        },
      }),
      prisma.receivable.findMany({
        where: {
          origin: 'SERVICE',
          status: 'PAID',
          paidAt: { gte: start, lte: end },
        },
      }),
      prisma.serviceCommissionProvision.findMany({
        where: {
          competenceMonth: month,
          competenceYear: year,
          status: { in: ['PROVISIONED', 'PAID'] },
        },
      }),
      prisma.payable.findMany({
        where: {
          dueDate: { gte: start, lte: end },
          status: { not: 'CANCELLED' },
        },
        include: {
          costCenter: true,
          supplier: true,
        },
      }),
    ]);

    const receitaBrutaProdutos = safeNumber(sales.reduce((acc, sale) => acc + Number(sale.total), 0));
    const receitaBrutaServicos = safeNumber(serviceReceivables.reduce((acc, item) => acc + Number(item.value), 0));
    const receitaBruta = safeNumber(receitaBrutaProdutos + receitaBrutaServicos);

    const deducoesTaxas = safeNumber(
      receivablesWithFees.reduce((acc, receivable) => acc + Number(receivable.cardFeeValue ?? 0), 0)
    );

    const comissaoProvisionada = safeNumber(
      commissionProvisions.reduce((acc, item) => acc + Number(item.commissionAmount), 0)
    );
    const deducoesTaxasServicos = safeNumber(
      serviceReceivables.reduce((acc, item) => acc + Number(item.cardFeeValue ?? 0), 0)
    );
    const receitaLiquidaServicos = safeNumber(receitaBrutaServicos - deducoesTaxasServicos - comissaoProvisionada);
    const receitaLiquida = safeNumber(receitaBruta - deducoesTaxas);

    const cpvByProduct = new Map<string, number>();
    for (const sale of sales) {
      for (const item of sale.items) {
        const label = item.product.commercialName;
        const cost = Number(item.costPrice) * item.quantity;
        cpvByProduct.set(label, (cpvByProduct.get(label) ?? 0) + cost);
      }
    }

    const cpvTotal = safeNumber(Array.from(cpvByProduct.values()).reduce((acc, value) => acc + value, 0));
    const lucroBruto = safeNumber(receitaLiquida - cpvTotal - comissaoProvisionada);

    const payablesAdmin = new Map<string, number>();
    const payablesMarketing = new Map<string, number>();
    const payablesFinancial = new Map<string, number>();

    for (const payable of payables) {
      const sourceLabel = payable.costCenter?.name || payable.supplier?.name || payable.description;
      const key = sourceLabel.trim() || 'Sem categoria';
      const value = Number(payable.value);
      const classification = classifyPayable(payable.description, payable.costCenter?.name ?? '');
      if (classification === 'MARKETING') {
        payablesMarketing.set(key, (payablesMarketing.get(key) ?? 0) + value);
        continue;
      }
      if (classification === 'FINANCIAL') {
        payablesFinancial.set(key, (payablesFinancial.get(key) ?? 0) + value);
        continue;
      }
      payablesAdmin.set(key, (payablesAdmin.get(key) ?? 0) + value);
    }

    const despesasFixasAdministrativas = safeNumber(Array.from(payablesAdmin.values()).reduce((acc, value) => acc + value, 0));
    const investimentosMarketing = safeNumber(Array.from(payablesMarketing.values()).reduce((acc, value) => acc + value, 0));
    const despesasFinanceiras = safeNumber(Array.from(payablesFinancial.values()).reduce((acc, value) => acc + value, 0));

    const ebitda = safeNumber(lucroBruto - despesasFixasAdministrativas - investimentosMarketing);
    const lucroLiquido = safeNumber(ebitda - despesasFinanceiras);

    const margemBruta = receitaLiquida > 0 ? safeNumber((lucroBruto / receitaLiquida) * 100) : 0;
    const margemLiquida = receitaLiquida > 0 ? safeNumber((lucroLiquido / receitaLiquida) * 100) : 0;
    const pontoEquilibrio = margemBruta > 0
      ? safeNumber((despesasFixasAdministrativas + investimentosMarketing + despesasFinanceiras) / (margemBruta / 100))
      : 0;

    const cpvDetails = Array.from(cpvByProduct.entries())
      .map(([label, value]) => ({ label, value: safeNumber(value) }))
      .sort((a, b) => b.value - a.value);

    const payableDetailsByMap = (data: Map<string, number>) =>
      Array.from(data.entries())
        .map(([label, value]) => ({ label, value: safeNumber(value) }))
        .sort((a, b) => b.value - a.value);

    const lines: DreLine[] = [
      {
        key: 'receita_bruta',
        label: '(+) Receita Bruta de Vendas',
        value: receitaBruta,
        percentOfNetRevenue: calcPercentOfNet(receitaBruta, receitaLiquida),
        isSubtotal: false,
        details: [],
      },
      {
        key: 'deducoes_taxas',
        label: '(-) Deduções e Impostos (Taxas de Cartão/Pix)',
        value: safeNumber(-deducoesTaxas),
        percentOfNetRevenue: calcPercentOfNet(deducoesTaxas, receitaLiquida),
        isSubtotal: false,
        details: [],
      },
      {
        key: 'comissao_tecnica_provisionada',
        label: '(-) Comissão Técnica Provisionada',
        value: safeNumber(-comissaoProvisionada),
        percentOfNetRevenue: calcPercentOfNet(comissaoProvisionada, receitaLiquida),
        isSubtotal: false,
        details: [],
      },
      {
        key: 'receita_liquida',
        label: '(=) Receita Líquida',
        value: receitaLiquida,
        percentOfNetRevenue: calcPercentOfNet(receitaLiquida, receitaLiquida),
        isSubtotal: true,
        details: [],
      },
      {
        key: 'cpv',
        label: '(-) CPV (Custo de Produtos Vendidos)',
        value: safeNumber(-cpvTotal),
        percentOfNetRevenue: calcPercentOfNet(cpvTotal, receitaLiquida),
        isSubtotal: false,
        details: cpvDetails,
      },
      {
        key: 'lucro_bruto',
        label: '(=) Lucro Bruto (Margem de Contribuição)',
        value: lucroBruto,
        percentOfNetRevenue: calcPercentOfNet(lucroBruto, receitaLiquida),
        isSubtotal: true,
        details: [],
      },
      {
        key: 'despesas_fixas',
        label: '(-) Despesas Fixas e Administrativas',
        value: safeNumber(-despesasFixasAdministrativas),
        percentOfNetRevenue: calcPercentOfNet(despesasFixasAdministrativas, receitaLiquida),
        isSubtotal: false,
        details: payableDetailsByMap(payablesAdmin),
      },
      {
        key: 'marketing',
        label: '(-) Investimentos/Marketing',
        value: safeNumber(-investimentosMarketing),
        percentOfNetRevenue: calcPercentOfNet(investimentosMarketing, receitaLiquida),
        isSubtotal: false,
        details: payableDetailsByMap(payablesMarketing),
      },
      {
        key: 'ebitda',
        label: '(=) EBITDA (Lucro Operacional)',
        value: ebitda,
        percentOfNetRevenue: calcPercentOfNet(ebitda, receitaLiquida),
        isSubtotal: true,
        details: [],
      },
      {
        key: 'despesas_financeiras',
        label: '(-) Despesas Financeiras (Juros/Tarifas)',
        value: safeNumber(-despesasFinanceiras),
        percentOfNetRevenue: calcPercentOfNet(despesasFinanceiras, receitaLiquida),
        isSubtotal: false,
        details: payableDetailsByMap(payablesFinancial),
      },
      {
        key: 'lucro_liquido',
        label: '(=) Lucro Líquido do Exercício',
        value: lucroLiquido,
        percentOfNetRevenue: calcPercentOfNet(lucroLiquido, receitaLiquida),
        isSubtotal: true,
        details: [],
      },
    ];

    return successResponse({
      period: {
        month,
        year,
        monthLabel: monthNamePtBR(month),
        start: start.toISOString(),
        end: end.toISOString(),
      },
      summary: {
        margemBruta,
        margemLiquida,
        pontoEquilibrio,
        receitaLiquidaServicos,
      },
      metadata: {
        salesCount: sales.length,
        payablesCount: payables.length,
        rules: {
          cpvSource: 'sale.items.costPrice',
          expenseDateField: 'payable.dueDate',
          revenueDateField: 'sale.date',
        },
      },
      lines,
      totals: {
        receitaBruta,
        receitaBrutaProdutos,
        receitaBrutaServicos,
        deducoesTaxas,
        comissaoProvisionada,
        receitaLiquidaServicos,
        receitaLiquida,
        cpvTotal,
        lucroBruto,
        despesasFixasAdministrativas,
        investimentosMarketing,
        ebitda,
        despesasFinanceiras,
        lucroLiquido,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
