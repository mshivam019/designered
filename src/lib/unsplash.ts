import { createApi } from 'unsplash-js';
import { env } from '@/env';

export const unsplash = createApi({
    accessKey: env.UNSPLASH_ACCESS_KEY,
    fetch: fetch
});
