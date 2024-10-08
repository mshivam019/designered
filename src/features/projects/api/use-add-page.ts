import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type InferRequestType, type InferResponseType } from 'hono';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
    (typeof client.api.projects)[':id']['addpage']['$post'],
    200
>;
type RequestType = InferRequestType<
    (typeof client.api.projects)[':id']['addpage']['$post']
>['json'];

export const useAddPage = (id: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.projects[':id'].addpage.$post({
                json,
                param: { id }
            });

            if (!response.ok) {
                throw new Error('Something went wrong');
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success('Page added');

            void queryClient.invalidateQueries({ queryKey: ['addPage'] });
            void queryClient.invalidateQueries({
                queryKey: ['project', { id }]
            });
        },
        onError: () => {
            toast.error('Failed to add page');
        }
    });

    return mutation;
};
