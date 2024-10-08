import * as z from 'zod';

export const userAuthSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string()
});
