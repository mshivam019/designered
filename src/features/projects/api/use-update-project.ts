import { toast } from 'sonner';
import { type InferRequestType, type InferResponseType } from 'hono';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
    (typeof client.api.projects)[':id']['$patch'],
    200
>;
type RequestType = InferRequestType<
    (typeof client.api.projects)[':id']['$patch']
>['json'];

export const useUpdateProject = (id: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ['project', { id }],
        mutationFn: async (json) => {
            const response = await client.api.projects[':id'].$patch({
                json,
                param: { id }
            });

            if (!response.ok) {
                throw new Error('Failed to update project');
            }

            return await response.json();
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['projects'] });
            void queryClient.invalidateQueries({ queryKey: ['project', { id }] });
        },
        onError: () => {
            toast.error('Failed to update project');
        }
    });

    return mutation;
};
