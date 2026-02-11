import { z } from 'zod';
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import bcrypt from 'bcryptjs';

import { db } from '@/server/db';
import { users, verificationTokens } from '@/server/db/schema';
import { sendOTPEmail, generateOTP } from '@/lib/email';

const app = new Hono()
    .post(
        '/',
        zValidator(
            'json',
            z.object({
                name: z.string(),
                email: z.string().email(),
                password: z.string().min(3).max(20)
            })
        ),
        async (c) => {
            const { name, email, password } = c.req.valid('json');

            const hashedPassword = await bcrypt.hash(password, 12);

            const query = await db
                .select()
                .from(users)
                .where(eq(users.email, email));

            if (query[0]) {
                return c.json({ error: 'Email already in use' }, 400);
            }

            await db.insert(users).values({
                email,
                name,
                password: hashedPassword,
                emailVerified: null
            });

            const otp = generateOTP();
            const hashedOtp = await bcrypt.hash(otp, 12);
            const expires = new Date(Date.now() + 10 * 60 * 1000);

            await db
                .delete(verificationTokens)
                .where(eq(verificationTokens.identifier, email));

            await db.insert(verificationTokens).values({
                identifier: email,
                token: hashedOtp,
                expires
            });

            await sendOTPEmail({ to: email, otp, name });

            return c.json({ requiresVerification: true }, 200);
        }
    )
    .post(
        '/verify-otp',
        zValidator(
            'json',
            z.object({
                email: z.string().email(),
                otp: z.string().length(6)
            })
        ),
        async (c) => {
            const { email, otp } = c.req.valid('json');

            const tokens = await db
                .select()
                .from(verificationTokens)
                .where(eq(verificationTokens.identifier, email));

            if (tokens.length === 0) {
                return c.json({ error: 'Invalid or expired code' }, 400);
            }

            const tokenRecord = tokens[0];

            if (new Date() > tokenRecord.expires) {
                await db
                    .delete(verificationTokens)
                    .where(eq(verificationTokens.identifier, email));
                return c.json({ error: 'Code has expired' }, 400);
            }

            const isValid = await bcrypt.compare(otp, tokenRecord.token);
            if (!isValid) {
                return c.json({ error: 'Invalid code' }, 400);
            }

            await db
                .update(users)
                .set({ emailVerified: new Date() })
                .where(eq(users.email, email));

            await db
                .delete(verificationTokens)
                .where(eq(verificationTokens.identifier, email));

            return c.json({ success: true }, 200);
        }
    )
    .post(
        '/resend-otp',
        zValidator(
            'json',
            z.object({
                email: z.string().email()
            })
        ),
        async (c) => {
            const { email } = c.req.valid('json');

            const userQuery = await db
                .select()
                .from(users)
                .where(eq(users.email, email));

            if (userQuery.length === 0) {
                return c.json({ error: 'User not found' }, 400);
            }

            const user = userQuery[0];
            if (user.emailVerified) {
                return c.json({ error: 'Email already verified' }, 400);
            }

            const otp = generateOTP();
            const hashedOtp = await bcrypt.hash(otp, 12);
            const expires = new Date(Date.now() + 10 * 60 * 1000);

            await db
                .delete(verificationTokens)
                .where(eq(verificationTokens.identifier, email));

            await db.insert(verificationTokens).values({
                identifier: email,
                token: hashedOtp,
                expires
            });

            await sendOTPEmail({ to: email, otp, name: user.name });

            return c.json({ success: true }, 200);
        }
    );

export default app;
