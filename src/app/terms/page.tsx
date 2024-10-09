import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TermsOfServicePage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <div className="space-y-4">
                <p>
                    Welcome to Designered. By using our design platform, you
                    agree to these terms. Please read them carefully.
                </p>

                <h2 className="text-2xl font-semibold mt-6">
                    1. Use of Service
                </h2>
                <p>
                    Designered provides a platform for creating and sharing
                    designs. You must be at least 13 years old to use this
                    service. You are responsible for maintaining the security of
                    your account, files, and design assets.
                </p>

                <h2 className="text-2xl font-semibold mt-6">2. User Conduct</h2>
                <p>You agree not to use Designered to:</p>
                <ul className="list-disc pl-6">
                    <li>Violate any laws or regulations</li>
                    <li>
                        Infringe on the intellectual property rights of others
                    </li>
                    <li>Upload harmful content or distribute malware</li>
                    <li>
                        Engage in fraudulent activities or abuse the platform
                    </li>
                </ul>

                <h2 className="text-2xl font-semibold mt-6">3. Content</h2>
                <p>
                    You retain ownership of any content, designs, or assets
                    created using Designered. By using the platform, you grant
                    us the right to use, store, and share your content as
                    necessary to operate and improve our services.
                </p>

                <h2 className="text-2xl font-semibold mt-6">
                    4. Third-Party Integrations
                </h2>
                <p>
                    Designered integrates with third-party services such as
                    cloud storage and external design tools. You are responsible
                    for any fees or issues arising from your use of these
                    third-party services, and their performance or availability
                    is beyond our control.
                </p>

                <h2 className="text-2xl font-semibold mt-6">
                    5. Limitation of Liability
                </h2>
                <p>
                    Designered is provided &quot;as is&quot; without any
                    warranties. We are not liable for any damages or losses
                    resulting from your use of the platform, including loss of
                    designs or data.
                </p>

                <h2 className="text-2xl font-semibold mt-6">
                    6. Changes to Terms
                </h2>
                <p>
                    We may modify these terms at any time. Continued use of
                    Designered after changes constitutes acceptance of the new
                    terms.
                </p>

                <h2 className="text-2xl font-semibold mt-6">7. Termination</h2>
                <p>
                    We reserve the right to terminate or suspend your account at
                    our discretion, without notice, for conduct that we believe
                    violates these terms or is harmful to other users, our
                    platform, or third parties, or for any other reason.
                </p>

                <p className="mt-6">
                    By using Designered, you acknowledge that you have read,
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
