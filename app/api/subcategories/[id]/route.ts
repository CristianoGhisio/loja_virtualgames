import { NextResponse } from 'next/server';


export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  void request;
  void params;
  return NextResponse.json({ error: 'Subcategorias foram unificadas em Categorias' }, { status: 410 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  void request;
  void params;
  return NextResponse.json({ error: 'Subcategorias foram unificadas em Categorias' }, { status: 410 });
}
