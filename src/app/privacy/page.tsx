import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="space-y-4">
        <p>At MultiChat, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information.</p>
        
        <h2 className="text-2xl font-semibold mt-6">1. Information We Collect</h2>
        <p>We collect information you provide directly to us, such as:</p>
        <ul className="list-disc pl-6">
          <li>Account information (e.g., name, email address)</li>
          <li>Chat content and interactions</li>
          <li>API keys you choose to use with our service</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-6">2. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul className="list-disc pl-6">
          <li>Provide and improve our services</li>
          <li>Communicate with you about your account or our services</li>
          <li>Protect against fraudulent or illegal activity</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-6">3. Data Security</h2>
        <p>We implement reasonable security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
        
        <h2 className="text-2xl font-semibold mt-6">4. Third-Party Services</h2>
        <p>MultiChat integrates with various AI models and services. Your use of these third-party services is subject to their respective privacy policies. We recommend reviewing these policies.</p>
        
        <h2 className="text-2xl font-semibold mt-6">5. Data Retention</h2>
        <p>We retain your personal information for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account data at any time.</p>
        
        <h2 className="text-2xl font-semibold mt-6">6. Your Rights</h2>
        <p>Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, or delete your data.</p>
        
        <h2 className="text-2xl font-semibold mt-6">7. Children&apos;s Privacy</h2>
        <p>Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
        
        <h2 className="text-2xl font-semibold mt-6">8. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
        
        <p className="mt-6">If you have any questions about this Privacy Policy, please contact us.</p>
      </div>
      <div className="mt-8">
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  )
}