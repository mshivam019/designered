import { z } from 'zod';
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';

import { db } from '@/server/db';
import { users } from '@/server/db/schema';

const app = new Hono().post(
    '/',
    zValidator(
        'json',
        z.object({
            name: z.string(),
            email: z.string().email()
        })
    ),
    async (c) => {
        const { name, email } = c.req.valid('json');

        const query = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

        if (query[0]) {
            return c.json({ error: 'Email already in use' }, 400);
        }

        await db.insert(users).values({
            email,
            name
        });

        return c.json(null, 200);
    }
);

export default app;
