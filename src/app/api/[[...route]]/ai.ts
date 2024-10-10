import { z } from 'zod';
import { Hono } from 'hono';
import { verifyAuth } from '@hono/auth-js';
import { zValidator } from '@hono/zod-validator';
import { env } from '@/env';

const app = new Hono().post(
    '/generate-image',
    verifyAuth(),
    zValidator(
        'json',
        z.object({
            prompt: z.string()
        })
    ),
    async (c) => {
        const { prompt } = c.req.valid('json');

        const input = {
            model: 'black-forest-labs/FLUX.1-schnell-Free',
            prompt,
            width: 1024,
            height: 768,
            steps: 1,
            n: 1,
            response_format: 'b64_json'
        };

        try {
            const request = await fetch(
                'https://api.together.xyz/v1/images/generations',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${env.TOGETHER_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(input)
                }
            );

            const jsonData = await request.json();

            return c.json({
                data: jsonData.data[0]
            });
        } catch (error) {
            return c.json(
                {
                    data: {
                        error: 'Failed to generate image',
                        b64_json: ''
                    }
                },
                500
            );
        }
    }
);

export default app;
