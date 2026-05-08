import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
        employees: {
          select: {
            fotoUrl: true,
            nomeCompleto: true,
          },
          take: 1
        }
      },
      where: {
        active: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const safeUsers = users.map(user => {
      const employeeName = user.employees?.[0]?.nomeCompleto?.trim();
      const displayName = employeeName && employeeName.length > 0 ? employeeName : user.name;

      return {
        id: user.id,
        name: displayName,
        email: user.email,
        avatar: user.employees?.[0]?.fotoUrl || user.image || `https://ui-avatars.com/api/?name=${displayName}&background=random`,
      };
    });

    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users for login:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
