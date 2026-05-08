import { NextRequest } from 'next/server';
import { checkAuth } from '@/lib/api-auth';
import { errorResponse, successResponse } from '@/lib/api-response';
import { isValidImageHeader } from '@/lib/utils';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

// File paths are validated against path traversal and allowed extensions
/* eslint-disable security/detect-non-literal-fs-filename */

const MAX_FILES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);

const sanitizeExtension = (fileName: string) => {
  const parts = fileName.split('.');
  const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  const clean = ext.replace(/[^a-z0-9]/g, '');
  return ALLOWED_EXTENSIONS.has(clean) ? clean : '';
};

/**
 * Resolve a file path and ensure it stays within the allowed directory.
 * Returns null if the path escapes the allowed directory.
 */
function safeResolvePath(baseDir: string, relativePath: string): string | null {
  const resolved = path.resolve(baseDir, relativePath);
  const normalizedBase = path.resolve(baseDir);
  if (!resolved.startsWith(normalizedBase + path.sep) && resolved !== normalizedBase) {
    return null;
  }
  return resolved;
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const formData = await req.formData();
    const files = formData
      .getAll('files')
      .filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
      return errorResponse('Nenhuma imagem enviada', 400);
    }

    if (files.length > MAX_FILES) {
      return errorResponse(`Máximo de ${MAX_FILES} imagens por envio`, 400);
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'os');
    await mkdir(uploadDir, { recursive: true });

    const uploaded: Array<{ url: string; filePath: string }> = [];

    for (const file of files) {
      // Validate MIME type
      if (!file.type.startsWith('image/')) {
        return errorResponse('Arquivo inválido. Envie apenas imagens.', 400);
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return errorResponse(`Arquivo muito grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`, 400);
      }

      // Validate extension
      const extension = sanitizeExtension(file.name);
      if (!extension) {
        return errorResponse('Extensão de arquivo não permitida. Use: jpg, jpeg, png, webp, gif', 400);
      }

      const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
      const absolutePath = path.join(uploadDir, fileName);

      // Verify the resolved path stays within uploadDir
      const safePath = safeResolvePath(uploadDir, fileName);
      if (!safePath) {
        return errorResponse('Caminho de arquivo inválido', 400);
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      // Validate magic bytes (basic image header check)
      if (!isValidImageHeader(buffer)) {
        return errorResponse('O conteúdo do arquivo não é uma imagem válida.', 400);
      }

      await writeFile(absolutePath, buffer);

      const relativePath = `uploads/os/${fileName}`;
      uploaded.push({
        url: `/${relativePath}`,
        filePath: relativePath,
      });
    }

    return successResponse({ files: uploaded }, 201);
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

    if (!filePath.startsWith('uploads/os/')) {
      return errorResponse('Caminho de arquivo inválido', 400);
    }

    // Prevent path traversal: resolve and verify the path stays within the uploads/os directory
    const baseDir = path.resolve(process.cwd(), 'public', 'uploads', 'os');
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
