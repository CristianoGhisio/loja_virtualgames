import { NextResponse } from 'next/server';


export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  void request;
  return NextResponse.json({ error: 'Subcategorias foram unificadas em Categorias' }, { status: 410 });
}

export async function POST(request: Request) {
  void request;
  return NextResponse.json({ error: 'Subcategorias foram unificadas em Categorias' }, { status: 410 });
}
