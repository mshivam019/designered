import { z } from 'zod';
import bcrypt from 'bcryptjs';
import type { NextAuthConfig } from 'next-auth';
import { eq } from 'drizzle-orm';
import { JWT } from 'next-auth/jwt';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';

import { db } from '@/server/db';
import { users } from '@/server/db/schema';

const CredentialsSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

declare module 'next-auth/jwt' {
    interface JWT {
        id: string | undefined;
    }
}

declare module '@auth/core/jwt' {
    interface JWT {
        id: string | undefined;
    }
}

export const authConfig = {
    adapter: DrizzleAdapter(db),
    providers: [
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'email' },
                pasword: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                const validatedFields =
                    CredentialsSchema.safeParse(credentials);

                if (!validatedFields.success) {
                    return null;
                }

                const { email, password } = validatedFields.data;

                const query = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, email));

                const user = query[0];

                if (!user || !user.password) {
                    return null;
                }

                const passwordsMatch = await bcrypt.compare(
                    password,
                    user.password
                );

                if (!passwordsMatch) {
                    return null;
                }

                return user;
            }
        }),
        Google
    ],
    pages: {
        signIn: '/login',
        error: '/register'
    },
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard =
                nextUrl.pathname.startsWith('/dashboard') ||
                nextUrl.pathname.startsWith('/editor');
            const isPublicPage = ['/terms', '/privacy', '/'].includes(
                nextUrl.pathname
            );

            // Allow access to public pages like terms and privacy even if logged in
            if (isPublicPage) return true;

            // Handle dashboard authorization
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }

            // Redirect logged-in users to the dashboard if they're trying to access other pages
            if (isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }

            // Allow unauthenticated users to access non-dashboard pages
            return true;
        },
        session({ session, token }) {
            if (token.id) {
                session.user.id = token.id;
            }

            return session;
        },
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }

            return token;
        }
    }
} satisfies NextAuthConfig;
