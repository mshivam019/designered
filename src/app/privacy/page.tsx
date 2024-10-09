import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicyPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <div className="space-y-4">
                <p>
                    At Designered, we are committed to protecting your privacy.
                    This Privacy Policy explains how we collect, use, and
                    safeguard your personal information when using our design
                    platform.
                </p>

                <h2 className="text-2xl font-semibold mt-6">
                    1. Information We Collect
                </h2>
                <p>
                    We collect information you provide directly to us, such as:
                </p>
                <ul className="list-disc pl-6">
                    <li>Account information (e.g., name, email address)</li>
                    <li>Design content and interactions on the platform</li>
                    <li>
                        Images, files, and templates uploaded to your workspace
                    </li>
                </ul>

                <h2 className="text-2xl font-semibold mt-6">
                    2. How We Use Your Information
                </h2>
                <p>We use your information to:</p>
                <ul className="list-disc pl-6">
                    <li>Provide and improve our design services and tools</li>
                    <li>
                        Communicate with you regarding your projects or account
                    </li>
                    <li>
                        Ensure platform security and prevent fraudulent activity
                    </li>
                </ul>

                <h2 className="text-2xl font-semibold mt-6">
                    3. Data Security
                </h2>
                <p>
                    We implement security measures to protect your design data
                    and personal information. However, no method of transmission
                    over the Internet or electronic storage is 100% secure.
                </p>

                <h2 className="text-2xl font-semibold mt-6">
                    4. Third-Party Integrations
                </h2>
                <p>
                    Designered integrates with various third-party services for
                    enhanced functionality, such as cloud storage and design
                    tools. Your use of these services is subject to their
                    privacy policies.
                </p>

                <h2 className="text-2xl font-semibold mt-6">
                    5. Data Retention
                </h2>
                <p>
                    We retain your personal and design data for as long as
                    necessary to provide our services and comply with legal
                    obligations. You may request the deletion of your data at
                    any time through your account settings.
                </p>

                <h2 className="text-2xl font-semibold mt-6">6. Your Rights</h2>
                <p>
                    Depending on your location, you may have rights regarding
                    your personal information, including the right to access,
                    correct, or delete your data.
                </p>

                <h2 className="text-2xl font-semibold mt-6">
                    7. Children&apos;s Privacy
                </h2>
                <p>
                    Our platform is not intended for children under 13, and we
                    do not knowingly collect information from children under
                    this age.
                </p>

                <h2 className="text-2xl font-semibold mt-6">
                    8. Changes to This Policy
                </h2>
                <p>
                    We may update this Privacy Policy from time to time. We will
                    notify you of any significant changes by posting the updated
                    policy on this page.
                </p>

                <p className="mt-6">
                    If you have any questions regarding this Privacy Policy,
                    please contact us.
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
