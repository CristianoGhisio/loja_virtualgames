import { NextResponse } from 'next/server';
import { ZodError, ZodIssue } from 'zod';
import { statusToCode, ErrorCodes } from './error-codes';

type ErrorBody = {
  success: false;
  error: string;
  code: string;
};

type ZodErrorBody = ErrorBody & {
  details: ZodIssue[];
};

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(error: unknown, status = 500): NextResponse<ErrorBody | ZodErrorBody> {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { success: false, error: 'Validation Error', code: ErrorCodes.VALIDATION_ERROR, details: error.issues },
      { status: 400 }
    );
  }

  if (typeof error === 'string') {
    if (status >= 500) {
      console.error('[API ERROR]', error);
    }
    return NextResponse.json(
      { success: false, error, code: statusToCode(status) },
      { status }
    );
  }

  if (error instanceof Error) {
    if (status >= 500 || error.message.includes('ECONNREFUSED')) {
      console.error('[API ERROR]', error.message);
    }
    const resolvedStatus = status === 500 && error.message.toLowerCase().includes('not found') ? 404 : status;
    return NextResponse.json(
      { success: false, error: error.message, code: statusToCode(resolvedStatus) },
      { status: resolvedStatus }
    );
  }

  console.error('[API ERROR] Unknown error type:', typeof error);
  return NextResponse.json(
    { success: false, error: 'Internal Server Error', code: ErrorCodes.INTERNAL_ERROR },
    { status: 500 }
  );
}
