/**
 * NextAuth configuration options.
 *
 * Kept in lib/ so it can be imported by both the API route handler and any
 * server component that needs `getServerSession(authOptions)`.
 */

import CredentialsProvider from 'next-auth/providers/credentials'
import GithubProvider from 'next-auth/providers/github'
import type { AuthOptions } from 'next-auth'
import type { UserRole } from '@/types'
import { getSupabaseService } from '@/lib/supabase'

// ─── Static user table (replace with Supabase lookup when ready) ──────────────

interface LocalUser {
  id: string
  name: string
  email: string
  passwordHash: string
  role: UserRole
}

/** Constant-time string comparison to resist timing attacks. */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

/**
 * Static placeholder users.  Passwords are stored as plain strings here only
 * because this is a development scaffold — replace with hashed passwords and a
 * database lookup before any production deployment.
 */
const STATIC_USERS: LocalUser[] = [
  {
    id: 'usr_admin',
    name: 'Admin',
    email: 'admin@domiciledeck.local',
    passwordHash: process.env.ADMIN_PASSWORD ?? 'change-me-admin',
    role: 'admin',
  },
  {
    id: 'usr_operator',
    name: 'Operator',
    email: 'operator@domiciledeck.local',
    passwordHash: process.env.OPERATOR_PASSWORD ?? 'change-me-operator',
    role: 'operator',
  },
]

function findLocalUser(email: string, password: string): LocalUser | null {
  const user = STATIC_USERS.find(u => u.email === email)
  if (!user) return null
  if (!safeCompare(password, user.passwordHash)) return null
  return user
}

/**
 * Look up a user's role from Supabase by email.
 * Returns the stored role, or 'viewer' if the user is not found or Supabase is unavailable.
 */
async function lookupUserRoleFromSupabase(email: string): Promise<UserRole> {
  const client = getSupabaseService()
  if (!client) return 'viewer'

  try {
    const { data, error } = await client
      .from('users')
      .select('role')
      .eq('email', email)
      .single()

    if (error || !data) {
      return 'viewer'
    }

    const role = data.role as UserRole
    // Validate that role is one of the valid roles
    if (['admin', 'operator', 'viewer'].includes(role)) {
      return role
    }
    return 'viewer'
  } catch {
    return 'viewer'
  }
}

// ─── NextAuth config ──────────────────────────────────────────────────────────

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null
        const user = findLocalUser(credentials.email, credentials.password)
        if (!user) return null
        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),
    // GitHub provider — only active when GITHUB_ID + GITHUB_SECRET are set.
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
          }),
        ]
      : []),
  ],

  callbacks: {
    /** Embed role in the JWT so it survives serialization. */
    async jwt({ token, user }) {
      if (user) {
        let role = (user as { role?: UserRole }).role

        // If the user doesn't have a role (e.g., OAuth providers), look it up from Supabase.
        if (!role && user.email) {
          role = await lookupUserRoleFromSupabase(user.email)
        }

        token.role = role ?? 'viewer'
        token.id = user.id
      }
      return token
    },

    /** Expose role and id on the session object. */
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as { role?: UserRole; id?: string }).role = token.role as UserRole
        ;(session.user as { id?: string }).id = token.id as string
      }
      return session
    },
  },

  pages: {
    signIn: '/auth/signin',
  },

  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },

  secret: process.env.NEXTAUTH_SECRET,
}
