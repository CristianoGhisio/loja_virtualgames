import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/api-response';
import { getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import { withSecurity } from '@/lib/with-security';
import { getRequestId } from '@/lib/request-id';
import { requireEnv } from '@/lib/env';
import { createHmac, timingSafeEqual } from 'node:crypto';


export const dynamic = 'force-dynamic';

const APPROVAL_SECRET = requireEnv('OS_APPROVAL_SECRET');

function generateApprovalToken(osId: string, cleanCpf: string): string {
  return createHmac('sha256', APPROVAL_SECRET)
    .update(`${osId}|${cleanCpf}`)
    .digest('hex');
}

function verifyApprovalToken(token: string, osId: string, cleanCpf: string): { valid: boolean; reason?: string } {
  try {
    if (!token || token.length === 0) {
      return { valid: false, reason: 'token vazio' };
    }

    const expected = createHmac('sha256', APPROVAL_SECRET)
      .update(`${osId}|${cleanCpf}`)
      .digest('hex');
    const tokenBuf = Buffer.from(token);
    const expectedBuf = Buffer.from(expected);

    if (tokenBuf.length !== expectedBuf.length) {
      return { valid: false, reason: 'tamanho do token não corresponde' };
    }

    const match = timingSafeEqual(tokenBuf, expectedBuf);
    return match
      ? { valid: true }
      : { valid: false, reason: 'token não corresponde ao contexto' };
  } catch (error) {
    return { valid: false, reason: `erro na verificação: ${error instanceof Error ? error.message : 'desconhecido'}` };
  }
}

const postHandler = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const payload = await req.json().catch(() => ({}));
  const decision = payload?.decision;
  const cpf = typeof payload?.cpf === 'string' ? payload.cpf : '';
  const token = typeof payload?.token === 'string' ? payload.token : '';
  const isApprove = decision === 'APPROVE';
  const isReject = decision === 'REJECT';
  const clientIp = getClientIp(req);
  const requestId = getRequestId();

  if (!isApprove && !isReject) {
    return errorResponse('Decisão inválida. Use APPROVE ou REJECT.', 400);
  }
  if (!cpf) {
    return errorResponse('CPF é obrigatório para aprovação pública.', 400);
  }

  const os = await prisma.serviceOrder.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          document: true,
        },
      },
    },
  });

  if (!os) {
    return errorResponse('Ordem de Serviço não encontrada', 404);
  }

  if (os.status !== 'AGUARDANDO_APROVACAO') {
    return errorResponse('Esta OS não está aguardando aprovação.', 400);
  }

  const cleanInputCpf = cpf.replace(/\D/g, '');
  const cleanStoredCpf = os.customer.document.replace(/\D/g, '');
  if (cleanInputCpf !== cleanStoredCpf) {
    return errorResponse('CPF não confere com o cadastro do cliente.', 403);
  }

  if (!token) {
    return errorResponse('Token de aprovação é obrigatório.', 401);
  }

  const verification = verifyApprovalToken(token, os.id, cleanStoredCpf);
  if (!verification.valid) {
    console.warn(JSON.stringify({
      requestId,
      level: 'warn',
      context: 'os-approval',
      message: `HMAC verification failed: ${verification.reason}`,
      osId: os.id,
      clientIp,
      timestamp: new Date().toISOString(),
    }));
    return errorResponse('Token de aprovação inválido ou expirado. Solicite um novo link de aprovação.', 401);
  }

  const targetStatus = isApprove ? 'APROVADO' : 'CANCELADO';
  const historyNote = isApprove
    ? `Aprovação do orçamento e continuidade do serviço confirmadas pelo cliente via site. IP: ${clientIp}`
    : `Desaprovação do orçamento e continuidade do serviço recusada pelo cliente via site. IP: ${clientIp}`;

  await prisma.$transaction(async (tx) => {
    await tx.serviceOrder.update({
      where: { id: os.id },
      data: {
        status: targetStatus,
      },
    });

    await tx.serviceOrderHistory.create({
      data: {
        serviceOrderId: os.id,
        status: targetStatus,
        notes: historyNote,
        userId: null,
      },
    });
  });

  return successResponse({
    success: true,
    message: isApprove
      ? 'Orçamento aprovado e serviço liberado para continuidade.'
      : 'Orçamento desaprovado e OS movida para cancelada.',
    status: targetStatus,
  });
};

export const POST = withSecurity(postHandler, { rateLimit: RATE_LIMITS.cpfValidation });

export { generateApprovalToken, verifyApprovalToken };
