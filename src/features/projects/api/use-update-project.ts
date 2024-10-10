import { toast } from 'sonner';
import { type InferRequestType, type InferResponseType } from 'hono';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
    (typeof client.api.projects)[':id']['pages'][':pageId']['$patch'],
    200
>;
type RequestType = InferRequestType<
    (typeof client.api.projects)[':id']['pages'][':pageId']['$patch']
>['json'];

export const useUpdateProject = (id: string, pageId: string) => {
    const queryClient = useQueryClient();
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ['page', { pageId }],
        mutationFn: async (json) => {
            const response = await client.api.projects[':id'].pages[
                ':pageId'
            ].$patch({
                param: {
                    id,
                    pageId
                },
                json
            });

            if (!response.ok) {
                throw new Error('Failed to update project');
            }

            return await response.json();
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ['page', { pageId }]
            });
            toast.success('Saved page!');
        },
        onError: () => {
            toast.error('Failed to update page, press save and refresh the page');
        }
    });

    return mutation;
};
