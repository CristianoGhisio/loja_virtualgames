import { NextRequest, NextResponse } from 'next/server';
import { EmployeeContractType, EmployeeStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/api-auth';


export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const resolvedParams = await params;
    const employee = await prisma.employee.findUnique({
      where: { id: resolvedParams.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!employee) {
      return NextResponse.json({ message: 'Funcionário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('GET /api/employees/[id] error:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar funcionário', error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const resolvedParams = await params;
    const body = await request.json();

    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!existingEmployee) {
      return NextResponse.json({ message: 'Funcionário não encontrado' }, { status: 404 });
    }

    // CPF validation if changed
    if (body.cpf && body.cpf !== existingEmployee.cpf) {
      const existingCpf = await prisma.employee.findUnique({
        where: { cpf: body.cpf }
      });

      if (existingCpf) {
        return NextResponse.json({ message: 'CPF já cadastrado em outro funcionário' }, { status: 400 });
      }
    }

    if (body.userId !== undefined) {
      const nextUserId = body.userId || null;
      if (nextUserId) {
        const linkedEmployee = await prisma.employee.findFirst({
          where: {
            userId: nextUserId,
            id: { not: resolvedParams.id },
          },
          select: { id: true, nomeCompleto: true },
        });
        if (linkedEmployee) {
          return NextResponse.json(
            { message: `Este usuário já está vinculado ao funcionário ${linkedEmployee.nomeCompleto}` },
            { status: 400 }
          );
        }
      }
    }

    const data: Prisma.EmployeeUncheckedUpdateInput = {};
    if (body.nomeCompleto !== undefined) data.nomeCompleto = body.nomeCompleto;
    if (body.cpf !== undefined) data.cpf = body.cpf;
    if (body.dataNascimento !== undefined) data.dataNascimento = new Date(body.dataNascimento);
    if (body.celularWhatsapp !== undefined) data.celularWhatsapp = body.celularWhatsapp;
    if (body.emailPessoal !== undefined) data.emailPessoal = body.emailPessoal || null;
    if (body.dataAdmissao !== undefined) data.dataAdmissao = new Date(body.dataAdmissao);
    if (body.cargoFuncao !== undefined) data.cargoFuncao = body.cargoFuncao;
    if (body.tipoContrato !== undefined) data.tipoContrato = body.tipoContrato as EmployeeContractType;
    if (body.salarioBase !== undefined) data.salarioBase = body.salarioBase;
    if (body.percentualComissao !== undefined) data.percentualComissao = body.percentualComissao || null;
    if (body.chavePix !== undefined) data.chavePix = body.chavePix || null;
    if (body.status !== undefined) data.status = body.status as EmployeeStatus;
    if (body.userId !== undefined) data.userId = body.userId || null;
    if (body.fotoUrl !== undefined) data.fotoUrl = body.fotoUrl || null;
    if (body.descricaoPerfil !== undefined) data.descricaoPerfil = body.descricaoPerfil || null;

    const employee = await prisma.employee.update({
      where: { id: resolvedParams.id },
      data,
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('PUT /api/employees/[id] error:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar funcionário', error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const resolvedParams = await params;
    const employee = await prisma.employee.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!employee) {
      return NextResponse.json({ message: 'Funcionário não encontrado' }, { status: 404 });
    }

    await prisma.employee.delete({
      where: { id: resolvedParams.id }
    });

    return NextResponse.json({ message: 'Funcionário excluído com sucesso' });
  } catch (error) {
    console.error('DELETE /api/employees/[id] error:', error);
    return NextResponse.json(
      { message: 'Erro ao excluir funcionário', error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
