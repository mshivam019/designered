import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TermsOfServicePage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <div className="space-y-4">
                <p>
                    Welcome to MultiChat. By using our service, you agree to
                    these terms. Please read them carefully.
                </p>

                <h2 className="text-2xl font-semibold mt-6">
                    1. Use of Service
                </h2>
                <p>
                    MultiChat provides a platform for interacting with multiple
                    language models. You must be at least 13 years old to use
                    this service. You are responsible for maintaining the
                    security of your account and API keys.
                </p>

                <h2 className="text-2xl font-semibold mt-6">2. User Conduct</h2>
                <p>You agree not to use MultiChat to:</p>
                <ul className="list-disc pl-6">
                    <li>Violate any laws or regulations</li>
                    <li>Infringe on the rights of others</li>
                    <li>Send spam or unsolicited messages</li>
                    <li>
                        Distribute malware or engage in malicious activities
                    </li>
                </ul>

                <h2 className="text-2xl font-semibold mt-6">3. Content</h2>
                <p>
                    You retain ownership of any content you create using
                    MultiChat. However, you grant us a license to use, store,
                    and share your content as necessary to provide and improve
                    our service.
                </p>

                <h2 className="text-2xl font-semibold mt-6">
                    4. API Keys and Third-Party Services
                </h2>
                <p>
                    MultiChat allows you to use your own API keys for various
                    language models. You are responsible for any charges
                    incurred through the use of these API keys. We are not
                    responsible for the performance or availability of
                    third-party services.
                </p>

                <h2 className="text-2xl font-semibold mt-6">
                    5. Limitation of Liability
                </h2>
                <p>
                    MultiChat is provided &quot;as is&quot; without any
                    warranties. We are not liable for any damages or losses
                    resulting from your use of the service.
                </p>

                <h2 className="text-2xl font-semibold mt-6">
                    6. Changes to Terms
                </h2>
                <p>
                    We may modify these terms at any time. Continued use of
                    MultiChat after changes constitutes acceptance of the new
                    terms.
                </p>

                <h2 className="text-2xl font-semibold mt-6">7. Termination</h2>
                <p>
                    We reserve the right to terminate or suspend your account at
                    our discretion, without notice, for conduct that we believe
                    violates these terms or is harmful to other users, us, or
                    third parties, or for any other reason.
                </p>

                <p className="mt-6">
                    By using MultiChat, you acknowledge that you have read,
                    understood, and agree to be bound by these Terms of Service.
                </p>
            </div>
            <div className="mt-8">
                <Button asChild>
                    <Link href="/">Return to Home</Link>
                </Button>
            </div>
        </div>
    );
}
