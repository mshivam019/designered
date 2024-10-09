import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type InferRequestType, type InferResponseType } from 'hono';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
    (typeof client.api.projects)[':id']['pages'][':pageId']['$delete'],
    200
>;
type RequestType = InferRequestType<
    (typeof client.api.projects)[':id']['pages'][':pageId']['$delete']
>;

export const useDeletePage = (id: string, pageId: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async () => {
            const response = await client.api.projects[':id'].pages[
                ':pageId'
            ].$delete({
                param: { id, pageId }
            });
            if (!response.ok) {
                throw new Error('Something went wrong');
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success('Page Deleted');
            void queryClient.invalidateQueries({
                queryKey: ['project', { id }]
            });
        },
        onError: () => {
            toast.error('Failed to delete page');
        }
    });

    return mutation;
};
