import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>

        <h1 className="text-4xl font-bold tracking-tight mb-2">Terms &amp; Conditions</h1>
        <p className="text-muted-foreground mb-8">Effective Date: February 23, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-4">
            <p className="font-semibold">⚠ Hobby Project &amp; Proof of Concept Notice</p>
            <p>TrailForge is a personal hobby project and proof of concept built by an individual developer. It is not a commercial product, is not affiliated with any company, and is provided on an as-is basis purely for experimental and educational purposes. By using TrailForge, you acknowledge and accept that this is an informal, non-commercial application and should be treated as such.</p>
          </div>

          <h2 className="text-2xl font-semibold mt-10 mb-4">1. Acceptance of Terms</h2>
          <p>By creating an account or using TrailForge in any way, you agree to these Terms &amp; Conditions. If you do not agree, please do not use the app.</p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">2. Use of the Service</h2>
          <p>TrailForge is a trip planning tool intended to help users organize backpacking routes, campsites, and gear. You may use it for personal, non-commercial purposes only.</p>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use TrailForge for any unlawful purpose.</li>
            <li>Attempt to access, scrape, or reverse-engineer any part of the app or its infrastructure.</li>
            <li>Upload or transmit harmful, offensive, or malicious content.</li>
            <li>Attempt to disrupt or interfere with the app&apos;s operation or Supabase&apos;s underlying infrastructure.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10 mb-4">3. No Warranty</h2>
          <p>TrailForge is provided <strong>&quot;as is&quot;</strong> and <strong>&quot;as available&quot;</strong> without warranty of any kind, express or implied. We make no guarantees regarding:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Uptime, availability, or reliability of the service.</li>
            <li>Accuracy or completeness of any trail, route, weather, or campsite information.</li>
            <li>Continuity of the service — TrailForge may be shut down, modified, or paused at any time without notice.</li>
          </ul>
          <p><strong>You should not rely on TrailForge as your sole source of information for any backcountry trip.</strong></p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">4. Safety Disclaimer</h2>
          <p>TrailForge is a planning aid only. It does not replace proper preparation, navigation skills, or sound judgment in the backcountry.</p>
          <p><strong>You are solely responsible for your own safety and the safety of anyone in your party.</strong> Always carry appropriate gear, check conditions with official sources, file a trip plan with a trusted contact, and be prepared for conditions to differ from what any app — including this one — suggests.</p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">5. Limitation of Liability</h2>
          <p>To the fullest extent permitted by applicable law, TrailForge and its developer shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your use of or inability to use the app.</li>
            <li>Loss, corruption, or deletion of your trip data.</li>
            <li>Any decisions made — including backcountry travel decisions — based on information within the app.</li>
            <li>Downtime, outages, or discontinuation of the service.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10 mb-4">6. Data &amp; Account Termination</h2>
          <p>We reserve the right to suspend or delete accounts at any time, for any reason, with or without notice. You are responsible for maintaining copies of any trip data you consider important. As noted in our <Link to="/privacy" className="text-primary underline underline-offset-4 hover:text-primary/80">Privacy Policy</Link>, we make no guarantees of long-term data preservation.</p>
          <p>You may request deletion of your account and data at any time by contacting us at the email in Section 9.</p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">7. Third-Party Services</h2>
          <p>TrailForge uses third-party services to operate, including Supabase for database and authentication infrastructure. Your use of TrailForge is also subject to Supabase&apos;s terms of service. We are not responsible for the availability or conduct of any third-party service.</p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">8. Changes to These Terms</h2>
          <p>We may update these Terms &amp; Conditions at any time. Changes will be reflected by an updated effective date at the top of this document. Continued use of TrailForge after changes are posted constitutes your acceptance of the revised terms.</p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">9. Contact</h2>
          <p>For any questions about these terms, please contact:</p>
          <p><a href="mailto:trailforge@robpitcher.com" className="text-primary underline underline-offset-4 hover:text-primary/80 font-semibold">trailforge@robpitcher.com</a></p>

          <p className="text-sm text-muted-foreground italic mt-8">TrailForge is a hobby project. These terms are provided in good faith but do not constitute legal advice. If you have specific legal concerns, please consult a qualified attorney.</p>
        </div>
      </div>
    </div>
  )
}
