import NextAuth from 'next-auth';
import NodeMailer from 'next-auth/providers/nodemailer';
import Google from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/server/db';
import {
    accounts,
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
        verificationTokensTable: verificationTokens
    }),
    providers: [
        NodeMailer({
            server: process.env.EMAIL_SERVER,
            from: process.env.EMAIL_FROM
        }),
        Google({
            allowDangerousEmailAccountLinking: true
        })
    ],
    
});
