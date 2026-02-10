import { z } from 'zod';
import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import { verifyAuth } from '@hono/auth-js';
import { zValidator } from '@hono/zod-validator';

import { db } from '@/server/db';
import { projects, pages, pagesInsertSchema } from '@/server/db/schema';

const pagesInsertSchemaWithoutTimestamps = pagesInsertSchema.omit({
    createdAt: true,
    updatedAt: true
});

const app = new Hono()
    .delete(
        '/:id',
        verifyAuth(),
        zValidator('param', z.object({ id: z.string() })),
        async (c) => {
            const auth = c.get('authUser');
            const { id } = c.req.valid('param');

            if (!auth.token?.id) {
                return c.json({ error: 'Unauthorized' }, 401);
            }

            const [Projectdata, PageData] = await Promise.all([
                db
                    .delete(projects)
                    .where(
                        and(
                            eq(projects.id, id),
                            eq(projects.userId, String(auth.token.id))
                        )
                    )
                    .returning(),
                db.delete(pages).where(eq(pages.projectId, id)).returning()
            ]);

            if (Projectdata.length === 0 && PageData.length === 0) {
                return c.json({ error: 'Not found' }, 404);
            }

            return c.json({ data: { id } });
        }
    )
    .post(
        '/:id/duplicate',
        verifyAuth(),
        zValidator('param', z.object({ id: z.string() })),
        async (c) => {
            const auth = c.get('authUser');
            const { id } = c.req.valid('param');

            if (!auth.token?.id) {
                return c.json({ error: 'Unauthorized' }, 401);
            }

            const [projectData, pagesData] = await Promise.all([
                db
                    .select()
                    .from(projects)
                    .where(
                        and(
                            eq(projects.id, id),
                            eq(projects.userId, String(auth.token.id))
                        )
                    ),
                db.select().from(pages).where(eq(pages.projectId, id))
            ]);

            if (projectData.length === 0 || pagesData.length === 0) {
                return c.json({ error: ' Not found' }, 404);
            }

            const project = projectData[0];
            if (!project) {
                return c.json({ error: 'Not found' }, 404);
            }

            const duplicateProjectData = await db
                .insert(projects)
                .values({
                    name: `Copy of ${project.name}`,
                    userId: String(auth.token.id),
                    createdAt: new Date(),
                    updatedAt: new Date()
                })
                .returning();

            const duplicatePagesData = await Promise.all(
                pagesData.map((page) =>
                    db
                        .insert(pages)
                        .values({
                            projectId: duplicateProjectData[0].id,
                            json: page.json,
                            width: page.width,
                            height: page.height,
                            pageNumber: page.pageNumber,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        })
                        .returning()
                )
            );

            const duplicateData = {
                ...duplicateProjectData[0],
                pages: duplicatePagesData
            };

            return c.json({ data: duplicateData });
        }
    )
    .get(
        '/',
        verifyAuth(),
        zValidator(
            'query',
            z.object({
                page: z.coerce.number(),
                limit: z.coerce.number()
            })
        ),
        async (c) => {
            const auth = c.get('authUser');
            const { page, limit } = c.req.valid('query');

            if (!auth.token?.id) {
                return c.json({ error: 'Unauthorized' }, 401);
            }

            const data = await db
                .select()
                .from(projects)
                .where(eq(projects.userId, String(auth.token.id)))
                .limit(limit)
                .offset((page - 1) * limit)
                .orderBy(desc(projects.updatedAt));

            return c.json({
                data,
                nextPage: data.length === limit ? page + 1 : null
            });
        }
    )
    .patch(
        '/:id/pages/:pageId',
        verifyAuth(),
        zValidator(
            'param',
            z.object({
                id: z.string(),
                pageId: z.string()
            })
        ),
        zValidator(
            'json',
            pagesInsertSchema.omit({
                id: true,
                createdAt: true,
                updatedAt: true
            })
        ),
        zValidator(
            'json',
            pagesInsertSchema
                .omit({
                    id: true,
                    createdAt: true,
                    updatedAt: true
                })
                .partial()
        ),
        async (c) => {
            const auth = c.get('authUser');
            const { id } = c.req.valid('param');
            const { pageId } = c.req.valid('param');
            const values = c.req.valid('json');
            if (!auth.token?.id) {
                return c.json({ error: 'Unauthorized' }, 401);
            }

            const data = await db
                .update(pages)
                .set({
                    ...values,
                    updatedAt: new Date()
                })
                .where(and(eq(pages.id, pageId), eq(pages.projectId, id)))
                .returning();
            if (data.length === 0) {
                return c.json({ error: 'Unauthorized' }, 401);
            }

            return c.json({ data: data[0] });
        }
    )
    .get(
        '/:id',
        verifyAuth(),
        zValidator('param', z.object({ id: z.string() })),
        async (c) => {
            const auth = c.get('authUser');
            const { id } = c.req.valid('param');

            if (!auth.token?.id) {
                return c.json({ error: 'Unauthorized' }, 401);
            }

            const pagesData = await db
                .select()
                .from(pages)
                .where(eq(pages.projectId, id));

            if (pagesData.length === 0) {
                return c.json({ error: 'Not found' }, 404);
            }

            return c.json({ data: pagesData });
        }
    )
    .post(
        '/',
        verifyAuth(),
        zValidator(
            'json',
            z.object({
                name: z.string(),
                json: z.string(),
                height: z.number(),
                width: z.number()
            })
        ),
        async (c) => {
            const auth = c.get('authUser');
            const { name, json, height, width } = c.req.valid('json');

            if (!auth.token?.id) {
                return c.json({ error: 'Unauthorized' }, 401);
            }

            const projectData = await db
                .insert(projects)
                .values({
                    name,
                    userId: String(auth.token.id),
                    createdAt: new Date(),
                    updatedAt: new Date()
                })
                .returning();

            if (!projectData[0]) {
                return c.json({ error: 'Something went wrong' }, 400);
            }

            const pagesData = await db
                .insert(pages)
                .values({
                    projectId: projectData[0].id,
                    json,
                    height,
                    width,
                    pageNumber: 1,
                    createdAt: new Date(),
                    updatedAt: new Date()
                })
                .returning();

            if (!pagesData[0]) {
                return c.json({ error: 'Something went wrong' }, 400);
            }

            const data = {
                ...projectData[0],
                pages: pagesData
            };

            return c.json({ data: data });
        }
    )
    .post(
        '/:id/addpage',
        verifyAuth(),
        zValidator(
            'json',
            pagesInsertSchema.pick({
                json: true,
                height: true,
                width: true,
                projectId: true,
                pageNumber: true
            })
        ),
        async (c) => {
            const auth = c.get('authUser');
            const values = c.req.valid('json');

            if (!auth.token?.id) {
                return c.json({ error: 'Unauthorized' }, 401);
            }

            const data = await db
                .insert(pages)
                .values({
                    ...values,
                    createdAt: new Date(),
                    updatedAt: new Date()
                })
                .returning();

            return c.json({ data: data[0] });
        }
    )
    .post(
        //this will receive the project id and update all pages as the body of the request will be an array of pages validated by the schema
        '/:id',
        verifyAuth(),
        zValidator('param', z.object({ id: z.string() })),
        zValidator('json', z.array(pagesInsertSchemaWithoutTimestamps)),
        async (c) => {
            const auth = c.get('authUser');
            const { id } = c.req.valid('param');
            const values = c.req.valid('json');

            if (!auth.token?.id) {
                return c.json({ error: 'Unauthorized' }, 401);
            }

            // make sure page.id exists and is not empty or invalid
            if (values.some((page) => !page.id || !page.id.trim())) {
                return c.json({ error: 'Invalid page id' }, 400);
            }
            //update all pages using the array of pages
            const data = await Promise.all(
                values.map((page) =>
                    db
                        .update(pages)
                        .set({
                            ...page,
                            updatedAt: new Date()
                        })
                        .where(
                            page.id
                                ? and(
                                      eq(pages.id, page.id),
                                      eq(pages.projectId, id)
                                  )
                                : eq(pages.projectId, id)
                        )
                        .returning()
                )
            );

            if (data.length === 0) {
                return c.json({ error: 'Unauthorized' }, 401);
            }

            return c.json({ data: data[0] });
        }
    )
    .delete(
        '/:id/pages/:pageId',
        verifyAuth(),
        zValidator(
            'param',
            z.object({
                id: z.string(),
                pageId: z.string()
            })
        ),
        async (c) => {
            const auth = c.get('authUser');
            const { id, pageId } = c.req.valid('param');

            if (!auth.token?.id) {
                return c.json({ error: 'Unauthorized' }, 401);
            }

            const data = await db
                .delete(pages)
                .where(and(eq(pages.id, pageId), eq(pages.projectId, id)))
                .returning();

            if (data.length === 0) {
                return c.json({ error: 'Unauthorized' }, 401);
            }

            return c.json({ data: data[0] });
        }
    );

export default app;
