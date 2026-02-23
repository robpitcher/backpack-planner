import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>

        <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Effective Date: February 23, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-4">
            <p className="font-semibold">⚠ Hobby Project &amp; Proof of Concept Notice</p>
            <p>TrailForge is a personal hobby project and proof of concept built by an individual developer. It is not a commercial product, is not affiliated with any company, and is provided on an as-is basis purely for experimental and educational purposes. By using TrailForge, you acknowledge and accept that this is an informal, non-commercial application and should be treated as such.</p>
          </div>

          <h2 className="text-2xl font-semibold mt-10 mb-4">1. What Information We Collect</h2>

          <h3 className="text-xl font-medium mt-6 mb-3">1.1 Information You Provide</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Email address</strong> — required to create an account and log in.</li>
            <li><strong>Display name</strong> — optional, used to personalize your experience.</li>
            <li><strong>Trip data</strong> — any routes, waypoints, campsites, gear lists, and notes you create within the app.</li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-3">1.2 Information Collected Automatically</h3>
          <p>Basic usage data may be collected by our infrastructure provider (Supabase) as part of normal app operation, such as authentication logs and request metadata. We do not actively instrument or analyze this data.</p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect solely to operate the app:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To create and manage your account.</li>
            <li>To save and retrieve your trip plans and gear lists.</li>
            <li>To send transactional emails such as password resets (if applicable).</li>
          </ul>
          <p>We do not use your data for advertising, analytics, or any commercial purpose.</p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">3. How We Share Your Information</h2>
          <p>We do not sell, rent, or trade your personal information to any third party.</p>
          <p>TrailForge uses <a href="https://supabase.com" className="text-primary underline underline-offset-4 hover:text-primary/80" target="_blank" rel="noopener noreferrer">Supabase</a> as its backend infrastructure provider. Your data is stored in Supabase-managed databases hosted on Amazon Web Services (AWS). Supabase processes your data solely to provide database, authentication, and storage services on our behalf. You can review Supabase&apos;s privacy policy at <a href="https://supabase.com/privacy" className="text-primary underline underline-offset-4 hover:text-primary/80" target="_blank" rel="noopener noreferrer">supabase.com/privacy</a>.</p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">4. Data Retention</h2>
          <p>Your data is retained for as long as your account exists. Because this is a hobby project, we make no guarantees regarding uptime, continuity, or long-term data preservation. You should not rely on TrailForge as your sole record of important trip plans.</p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access the personal data we hold about you.</li>
            <li>Request deletion of your account and associated data.</li>
            <li>Correct inaccurate information in your profile.</li>
          </ul>
          <p>To exercise any of these rights, please contact us at the email address listed in Section 8. We will respond to reasonable requests within 30 days.</p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">6. Security</h2>
          <p>We take reasonable steps to protect your information. Authentication and data storage are handled by Supabase, which implements industry-standard security practices including encryption at rest and in transit.</p>
          <p>However, as a hobby project operated by a single developer with no dedicated security team, we cannot guarantee the security of your data. Please do not store sensitive personal information beyond what is necessary to use the app.</p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">7. Children&apos;s Privacy</h2>
          <p>TrailForge is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.</p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">8. Contact</h2>
          <p>If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact:</p>
          <p><a href="mailto:trailforge@robpitcher.com" className="text-primary underline underline-offset-4 hover:text-primary/80 font-semibold">trailforge@robpitcher.com</a></p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. If we make material changes, we will update the effective date at the top of this document. Continued use of TrailForge after changes are posted constitutes acceptance of the updated policy.</p>

          <p className="text-sm text-muted-foreground italic mt-8">TrailForge is a hobby project. This document is provided in good faith but does not constitute legal advice.</p>
        </div>
      </div>
    </div>
  )
}
