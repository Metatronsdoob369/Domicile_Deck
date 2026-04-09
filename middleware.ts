/**
 * Next.js edge middleware.
 *
 * Responsibilities:
 *  1. Protect API routes that execute commands behind authentication.
 *  2. Reject requests to dangerous-command routes from non-admin/operator users.
 *
 * Protected paths (require a valid NextAuth session):
 *   POST /api/commands/run  – executes a shell command
 *   GET  /api/runs          – returns run history
 *   POST /api/runs          – queues a run
 *
 * Only the /api/auth/* routes and static assets are always public.
 */

import { getToken } from 'next-auth/jwt'
import { NextResponse, type NextRequest } from 'next/server'
import type { UserRole } from '@/types'

/** Routes that require the user to be authenticated (all methods). */
const PROTECTED_PATTERNS = [/^\/api\/commands\/run/, /^\/api\/runs/]

/** Minimum role required to execute commands. */
const EXECUTE_ROLES: UserRole[] = ['admin', 'operator']

function isProtected(pathname: string): boolean {
  return PROTECTED_PATTERNS.some(re => re.test(pathname))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isProtected(pathname)) {
    return NextResponse.next()
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token) {
    return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 })
  }

  // For mutation endpoints, also verify the caller has an execution role.
  if (request.method === 'POST') {
    const role = (token.role ?? 'viewer') as UserRole
    if (!EXECUTE_ROLES.includes(role)) {
      return NextResponse.json(
        { ok: false, error: 'Insufficient permissions.' },
        { status: 403 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/commands/run', '/api/runs'],
}
