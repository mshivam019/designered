import NextAuth from 'next-auth';
import NodeMailer from 'next-auth/providers/nodemailer';
import Google from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/server/db';
import { env } from './env';

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: {
        strategy: 'jwt'
    },
    adapter: DrizzleAdapter(db),
    providers: [
        NodeMailer({
            server: env.EMAIL_SERVER,
            from: env.EMAIL_FROM
        }),
        Google({
            allowDangerousEmailAccountLinking: true
        })
    ]
});
