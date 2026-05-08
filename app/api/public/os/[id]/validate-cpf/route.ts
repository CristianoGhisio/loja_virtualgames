import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/api-response';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { withSecurity } from '@/lib/with-security';

const postHandler = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const { cpf } = await req.json();

  if (!cpf) {
    return errorResponse('CPF é obrigatório para validação', 400);
  }

  const os = await prisma.serviceOrder.findUnique({
    where: { id },
    include: {
      customer: true,
    },
  });

  if (!os) {
    return errorResponse('Ordem de Serviço não encontrada', 404);
  }

  const cleanInputCpf = cpf.replace(/\D/g, '');
  const cleanStoredCpf = os.customer.document.replace(/\D/g, '');

  if (cleanInputCpf !== cleanStoredCpf) {
    return successResponse({ match: false, message: 'CPF não confere com o cadastro do cliente.' });
  }

  return successResponse({ match: true, message: 'CPF confirmado com sucesso.' });
};

export const POST = withSecurity(postHandler, { rateLimit: RATE_LIMITS.cpfValidation });
