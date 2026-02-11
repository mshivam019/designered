import { toast } from 'sonner';
import { type InferRequestType, type InferResponseType } from 'hono';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
    (typeof client.api.projects)[':id']['$post'],
    200
>;
type RequestType = InferRequestType<
    (typeof client.api.projects)[':id']['$post']
>['json'];

export const useSaveAllPages = (id: string) => {
    const queryClient = useQueryClient();
    const mutation = useMutation<
        ResponseType,
        Error,
        { pages: RequestType; silent?: boolean }
    >({
        mutationKey: ['projectpages', { id }],
        mutationFn: async ({ pages }) => {
            const response = await client.api.projects[':id'].$post({
                param: {
                    id
                },
                json: pages
            });

            if (!response.ok) {
                throw new Error('Failed to update project');
            }

            return await response.json();
        },
        onSuccess: (_data, variables) => {
            void queryClient.invalidateQueries({
                queryKey: ['projectpages', { id }]
            });
            if (!variables.silent) {
                toast.success('Saved all pages!');
            }
        },
        onError: (_error, variables) => {
            if (!variables.silent) {
                toast.error('Failed to update project');
            }
        }
    });

    return mutation;
};
