import { NextRequest, NextResponse } from 'next/server';
import { EmployeeContractType, EmployeeStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { checkAuth } from '@/lib/api-auth';

export async function GET() {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
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

    return NextResponse.json(employees);
  } catch (error) {
    console.error('GET /api/employees error:', error);
    return NextResponse.json(
      { message: 'Erro ao listar funcionários', error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const body = await request.json();
    
    // Basic validation
    if (!body.nomeCompleto || !body.cpf || !body.dataNascimento || !body.celularWhatsapp || !body.dataAdmissao || !body.cargoFuncao || !body.tipoContrato || body.salarioBase === undefined) {
      return NextResponse.json(
        { message: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }

    // CPF validation (just format masking and checking if it's unique)
    const existingCpf = await prisma.employee.findUnique({
      where: { cpf: body.cpf }
    });

    if (existingCpf) {
      return NextResponse.json(
        { message: 'CPF já cadastrado' },
        { status: 400 }
      );
    }

    // Enums
    const tipoContrato = body.tipoContrato as EmployeeContractType;
    const status = (body.status as EmployeeStatus) || EmployeeStatus.ATIVO;

    let userId = body.userId || null;

    if (userId) {
      const linkedEmployee = await prisma.employee.findFirst({
        where: { userId },
        select: { id: true, nomeCompleto: true },
      });
      if (linkedEmployee) {
        return NextResponse.json(
          { message: `Este usuário já está vinculado ao funcionário ${linkedEmployee.nomeCompleto}` },
          { status: 400 }
        );
      }
    }

    if (body.createUser) {
      if (!body.emailPessoal) {
        return NextResponse.json({ error: 'E-mail pessoal é obrigatório para criar usuário' }, { status: 400 });
      }
      if (!body.userPassword || !body.userRoleId) {
        return NextResponse.json({ error: 'Senha e perfil de acesso são obrigatórios para criar usuário' }, { status: 400 });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: body.emailPessoal }
      });

      if (existingUser) {
        return NextResponse.json({ error: 'Já existe um usuário com este e-mail' }, { status: 400 });
      }

      const passwordHash = await hash(body.userPassword, 10);
      
      const newUser = await prisma.user.create({
        data: {
          name: body.nomeCompleto,
          email: body.emailPessoal,
          password: passwordHash,
          roleId: body.userRoleId,
        }
      });
      
      userId = newUser.id;
    }

    const employee = await prisma.employee.create({
      data: {
        nomeCompleto: body.nomeCompleto,
        cpf: body.cpf,
        dataNascimento: new Date(body.dataNascimento),
        celularWhatsapp: body.celularWhatsapp,
        emailPessoal: body.emailPessoal || null,
        dataAdmissao: new Date(body.dataAdmissao),
        cargoFuncao: body.cargoFuncao,
        tipoContrato,
        salarioBase: body.salarioBase,
        percentualComissao: body.percentualComissao || null,
        chavePix: body.chavePix || null,
        status,
        userId,
        fotoUrl: body.fotoUrl || null,
        descricaoPerfil: body.descricaoPerfil || null,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('POST /api/employees error:', error);
    return NextResponse.json(
      { message: 'Erro ao criar funcionário', error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
