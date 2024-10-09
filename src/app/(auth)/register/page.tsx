import Link from 'next/link';
import { Suspense } from 'react';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import Image from 'next/image';
import { UserAuthForm } from '@/components/user-auth-form';
import { Palette, Wand2, Layers } from 'lucide-react';

export const metadata = {
    title: 'Create a Designered account',
    description: 'Create an account to start designing beautiful content.'
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
            <div className="hidden h-full flex-col bg-sky-50 p-10 text-slate-600 dark:border-r lg:flex">
                <div className="flex items-center text-lg font-medium text-slate-900">
                    <Palette className="mr-2 h-6 w-6 text-blue-500" />
                    <span>Designered</span>
                </div>
                <div className="mt-auto">
                    <h1 className="text-4xl font-bold text-slate-900">
                        Create Beautiful Designs
                    </h1>
                    <p className="mt-4 text-lg text-slate-700">
                        Your all-in-one platform for stunning visual content
                    </p>
                    <ul className="mt-8 grid gap-4 text-sm text-slate-700">
                        <li className="flex items-center">
                            <Palette className="mr-2 h-5 w-5 text-blue-500" />
                            Intuitive drag-and-drop design editor
                        </li>
                        <li className="flex items-center">
                            <Wand2 className="mr-2 h-5 w-5 text-blue-500" />
                            AI-powered design suggestions and templates
                        </li>
                        <li className="flex items-center">
                            <Layers className="mr-2 h-5 w-5 text-blue-500" />
                            1000+ customizable templates for any occasion
                        </li>
                    </ul>
                </div>
                <p className="mt-auto text-sm text-slate-500">
                    © {new Date().getFullYear()} Designered. All rights
                    reserved.
                </p>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <div className="w-12 h-12 mx-auto relative">
                            <Image src="/icon.png" alt="Designered" fill />
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                            Create an account
                        </h1>
                        <p className="text-sm text-slate-600">
                            Enter your email to start creating beautiful designs
                        </p>
                    </div>
                    <Suspense fallback={<div>Loading...</div>}>
                        <UserAuthForm />
                    </Suspense>
                    <p className="px-8 text-center text-sm text-slate-500">
                        By clicking continue, you agree to our{' '}
                        <Link
                            href="/terms"
                            className="hover:text-blue-500 underline underline-offset-4"
                        >
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link
                            href="/privacy"
                            className="hover:text-blue-500 underline underline-offset-4"
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
