import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { type AuthConfig, initAuthConfig } from '@hono/auth-js';

import users from './users';
import images from './images';
import projects from './projects';
import ai from './ai';

import { authConfig } from '@/auth.config';
import { env } from '@/env';

// Revert to "edge" if planning on running on the edge
export const runtime = 'nodejs';

function getAuthConfig(): AuthConfig {
    return {
        secret: env.AUTH_SECRET,
        ...authConfig
    };
}

const app = new Hono().basePath('/api');

app.use('*', initAuthConfig(getAuthConfig));

const routes = app
    .route('/users', users)
    .route('/images', images)
    .route('/projects', projects)
    .route('/ai', ai);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
