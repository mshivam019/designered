'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVerifyOTP } from '@/features/auth/hooks/use-verify-otp';
import { useResendOTP } from '@/features/auth/hooks/use-resend-otp';

interface OTPVerificationProps {
    email: string;
    onVerified: () => void;
    onCancel?: () => void;
}

export const OTPVerification = ({
    email,
    onVerified,
    onCancel
}: OTPVerificationProps) => {
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
    const [countdown, setCountdown] = useState(60);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const verifyMutation = useVerifyOTP();
    const resendMutation = useResendOTP();

    // Countdown timer for resend
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const handleChange = useCallback(
        (index: number, value: string) => {
            if (!/^\d*$/.test(value)) return;

            const newOtp = [...otp];
            newOtp[index] = value.slice(-1);
            setOtp(newOtp);

            // Auto-focus next input
            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }

            // Auto-submit when complete
            const fullOtp = newOtp.join('');
            if (fullOtp.length === 6 && index === 5) {
                verifyMutation.mutate(
                    { email, otp: fullOtp },
                    {
                        onSuccess: () => {
                            onVerified();
                        }
                    }
                );
            }
        },
        [otp, email, verifyMutation, onVerified]
    );

    const handleKeyDown = useCallback(
        (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Backspace' && !otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        },
        [otp]
    );

    const handlePaste = useCallback(
        (e: React.ClipboardEvent) => {
            e.preventDefault();
            const pasted = e.clipboardData
                .getData('text')
                .replace(/\D/g, '')
                .slice(0, 6);
            if (!pasted) return;

            const newOtp = [...otp];
            for (let i = 0; i < pasted.length && i < 6; i++) {
                newOtp[i] = pasted[i];
            }
            setOtp(newOtp);

            // Focus the next empty input or the last one
            const nextIndex = Math.min(pasted.length, 5);
            inputRefs.current[nextIndex]?.focus();

            // Auto-submit if 6 digits pasted
            if (pasted.length === 6) {
                verifyMutation.mutate(
                    { email, otp: pasted },
                    {
                        onSuccess: () => {
                            onVerified();
                        }
                    }
                );
            }
        },
        [otp, email, verifyMutation, onVerified]
    );

    const handleResend = useCallback(() => {
        resendMutation.mutate({ email });
        setCountdown(60);
    }, [email, resendMutation]);

    const handleVerify = useCallback(() => {
        const fullOtp = otp.join('');
        if (fullOtp.length !== 6) return;
        verifyMutation.mutate(
            { email, otp: fullOtp },
            {
                onSuccess: () => {
                    onVerified();
                }
            }
        );
    }, [otp, email, verifyMutation, onVerified]);

    const isComplete = otp.every((digit) => digit !== '');

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                    Verify your email
                </h2>
                <p className="text-sm text-slate-600">
                    We sent a 6-digit code to{' '}
                    <span className="font-medium text-slate-900">{email}</span>
                </p>
            </div>

            {/* OTP Inputs */}
            <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => {
                            inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        disabled={verifyMutation.isPending}
                        className={cn(
                            'w-11 h-14 text-center text-xl font-semibold rounded-lg border transition-all',
                            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                            'border-slate-200 text-slate-900',
                            verifyMutation.isPending &&
                                'opacity-50 cursor-not-allowed'
                        )}
                    />
                ))}
            </div>

            {/* Error message */}
            {verifyMutation.isError && (
                <p className="text-center text-sm text-red-500">
                    Invalid verification code. Please try again.
                </p>
            )}

            {/* Verify Button */}
            <Button
                onClick={handleVerify}
                disabled={!isComplete || verifyMutation.isPending}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
                {verifyMutation.isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                    </>
                ) : (
                    'Verify'
                )}
            </Button>

            {/* Resend */}
            <div className="text-center">
                {countdown > 0 ? (
                    <p className="text-sm text-slate-500">
                        Resend code in{' '}
                        <span className="font-medium">{countdown}s</span>
                    </p>
                ) : (
                    <button
                        onClick={handleResend}
                        disabled={resendMutation.isPending}
                        className="text-sm text-blue-500 hover:text-blue-600 font-medium disabled:opacity-50"
                    >
                        {resendMutation.isPending
                            ? 'Sending...'
                            : 'Resend code'}
                    </button>
                )}
            </div>

            {/* Cancel */}
            {onCancel && (
                <button
                    onClick={onCancel}
                    className="w-full text-center text-sm text-slate-500 hover:text-slate-700"
                >
                    Back to signup
                </button>
            )}
        </div>
    );
};
