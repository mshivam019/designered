import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
    (typeof client.api.users)['resend-otp']['$post']
>;
type RequestType = InferRequestType<
    (typeof client.api.users)['resend-otp']['$post']
>['json'];

export const useResendOTP = () => {
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.users['resend-otp'].$post({
                json
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Failed to resend code');
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success('Verification code sent');
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    return mutation;
};
