import NextAuth from 'next-auth';
import NodeMailder from 'next-auth/providers/nodemailer';
import Google from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/server/db';
import {
    accounts,
    sessions,
    users,
    verificationTokens
} from '@/server/db/schema';

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: {
        strategy: 'jwt',
    },
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens
    }),
    providers: [
        NodeMailder({
            server: process.env.EMAIL_SERVER,
            from: process.env.EMAIL_FROM
        }),
        Google
    ],
    
});
