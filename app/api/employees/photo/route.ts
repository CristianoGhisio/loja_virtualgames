import { NextRequest } from 'next/server';
import { checkAuth } from '@/lib/api-auth';
import { errorResponse, successResponse } from '@/lib/api-response';
import { isValidImageHeader } from '@/lib/utils';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

// File paths are validated against path traversal and allowed extensions
/* eslint-disable security/detect-non-literal-fs-filename */


export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);

const sanitizeExtension = (fileName: string) => {
  const parts = fileName.split('.');
  const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  const clean = ext.replace(/[^a-z0-9]/g, '');
  return ALLOWED_EXTENSIONS.has(clean) ? clean : '';
};

const ensureImage = (file: File) => file.type.startsWith('image/');

export async function POST(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return errorResponse('Nenhuma imagem enviada', 400);
    }

    if (!ensureImage(file)) {
      return errorResponse('Arquivo inválido. Envie uma imagem.', 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(`Arquivo muito grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`, 400);
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'employees');
    await mkdir(uploadDir, { recursive: true });

    const extension = sanitizeExtension(file.name);
    if (!extension) {
      return errorResponse('Extensão de arquivo não permitida. Use: jpg, jpeg, png, webp, gif', 400);
    }
    const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
    const absolutePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());

    if (!isValidImageHeader(buffer)) {
      return errorResponse('O conteúdo do arquivo não é uma imagem válida.', 400);
    }

    await writeFile(absolutePath, buffer);

    const relativePath = `uploads/employees/${fileName}`;
    return successResponse(
      {
        url: `/${relativePath}`,
        filePath: relativePath,
      },
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const body = await req.json();
    const filePath = typeof body.filePath === 'string' ? body.filePath : '';

    if (!filePath.startsWith('uploads/employees/')) {
      return errorResponse('Caminho de arquivo inválido', 400);
    }

    // Prevent path traversal
    const baseDir = path.resolve(process.cwd(), 'public', 'uploads', 'employees');
    const absolutePath = path.resolve(process.cwd(), 'public', filePath);

    if (!absolutePath.startsWith(baseDir + path.sep) && absolutePath !== baseDir) {
      return errorResponse('Caminho de arquivo inválido', 400);
    }
    try {
      await unlink(absolutePath);
    } catch {
      return successResponse({ success: true });
    }

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
