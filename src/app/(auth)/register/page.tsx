import Link from 'next/link';
import { Suspense } from 'react';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { UserAuthForm } from '@/components/user-auth-form';
import { MessageSquare, Zap, Key } from 'lucide-react';

export const metadata = {
    title: 'Create an account',
    description: 'Create an account to get started.'
};

export default function RegisterPage() {
    return (
        <div className="container grid h-screen w-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
            <Link
                href="/login"
                className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    'absolute right-4 top-4 md:right-8 md:top-8'
                )}
            >
                Login
            </Link>
            <div className="hidden h-full flex-col bg-muted p-10 text-muted-foreground dark:border-r lg:flex">
                <div className="flex items-center text-lg font-medium">
                    <MessageSquare className="mr-2 h-6 w-6" />
                    <span>MultiChat</span>
                </div>
                <div className="mt-auto">
                    <h1 className="text-4xl font-bold text-foreground">
                        Welcome to MultiChat
                    </h1>
                    <p className="mt-4 text-lg">
                        Your gateway to multi-LLM conversations
                    </p>
                    <ul className="mt-8 grid gap-4 text-sm">
                        <li className="flex items-center">
                            <Zap className="mr-2 h-5 w-5 text-primary" />
                            Chat with multiple AI models simultaneously
                        </li>
                        <li className="flex items-center">
                            <Key className="mr-2 h-5 w-5 text-primary" />
                            Bring your own API keys for maximum flexibility
                        </li>
                        <li className="flex items-center">
                            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                            Unified interface for seamless conversations
                        </li>
                    </ul>
                </div>
                <p className="mt-auto text-sm text-muted-foreground">
                    © {new Date().getFullYear()} MultiChat. All rights
                    reserved.
                </p>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <Icons.logo className="mx-auto h-6 w-6" />
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Create an account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email below to create your account
                        </p>
                    </div>
                    <Suspense fallback={<div>Loading...</div>}>
                        <UserAuthForm />
                    </Suspense>
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{' '}
                        <Link
                            href="/terms"
                            className="hover:text-brand underline underline-offset-4"
                        >
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link
                            href="/privacy"
                            className="hover:text-brand underline underline-offset-4"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
