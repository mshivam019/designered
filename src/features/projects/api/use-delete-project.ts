import { toast } from 'sonner';
import { type InferRequestType, type InferResponseType } from 'hono';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
    (typeof client.api.projects)[':id']['$delete'],
    200
>;
type RequestType = InferRequestType<
    (typeof client.api.projects)[':id']['$delete']
>['param'];

export const useDeleteProject = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (param) => {
            const response = await client.api.projects[':id'].$delete({
                param
            });

            if (!response.ok) {
                throw new Error('Failed to delete project');
            }

            return await response.json();
        },
        onSuccess: ({ data }) => {
            void queryClient.invalidateQueries({ queryKey: ['projects'] });
            void queryClient.invalidateQueries({
                queryKey: ['project', { id: data.id }]
            });
        },
        onError: () => {
            toast.error('Failed to delete project');
        }
    });

    return mutation;
};
