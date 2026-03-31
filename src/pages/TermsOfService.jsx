import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsOfService() {
  return (
    <div className="bg-vellera-dark min-h-screen text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link to="/landing" className="flex items-center gap-2 text-vellera-blue hover:text-vellera-green transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-5xl font-black mb-2">Terms of Service</h1>
          <p className="text-gray-400">Vellera Fitness & Combat Sports Application</p>
          <p className="text-gray-500 text-sm mt-2">Last Updated: [Insert Date]</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-300 leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By downloading, installing, and using the Vellera mobile application ("App"), you ("User" or "you") agree to be bound by these Terms of Service ("ToS"). If you do not agree to any part of these terms, you may not use the App. Vellera is owned and operated by Emerging Defense Solutions LLC ("EDS," "Company," "we," or "us").
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Medical & Physical Liability Waiver</h2>
            <div className="bg-red-950/30 border border-red-800 rounded-xl p-6 space-y-4">
              <h3 className="text-xl font-bold text-red-300">⚠️ CRITICAL HEALTH & SAFETY DISCLAIMER</h3>

              <div className="space-y-4 text-red-100">
                <p className="font-bold">
                  VELLERA AND EMERGING DEFENSE SOLUTIONS (EDS) ARE NOT LICENSED MEDICAL PROVIDERS AND DO NOT PROVIDE MEDICAL ADVICE.
                </p>

                <p>
                  The Vellera App provides general fitness programming, mobility routines, strength training protocols, and high-intensity combat sports conditioning (including MMA, boxing, and grappling drills). These activities carry inherent risks of severe injury, including but not limited to:
                </p>

                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Acute orthopedic injuries (fractures, ligament tears, muscle strains)</li>
                  <li>Neurological injury (concussions, traumatic brain injury)</li>
                  <li>Cardiovascular complications (arrhythmias, heart attack, stroke)</li>
                  <li>Spinal cord injury and permanent paralysis</li>
                  <li>Death</li>
                </ul>

                <p className="font-bold mt-4">USER ASSUMPTION OF RISK</p>
                <p>
                  By using this App, you acknowledge and assume 100% of the risk associated with any physical training, exercise, or combat sports conditioning. You confirm that:
                </p>

                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>You are in good physical health and have no underlying medical conditions that would contraindicate exercise.</li>
                  <li>You have consulted with a licensed physician before beginning any training program, especially if you have a history of cardiovascular, orthopedic, or neurological conditions.</li>
                  <li>You are physically capable of performing the exercises and drills presented in the App.</li>
                  <li>You will not hold Vellera, EDS, or any team members liable for any injury, death, or damage resulting from your use of the App.</li>
                  <li>You will follow all safety instructions and modify exercises if you experience pain or discomfort.</li>
                </ul>

                <p className="font-bold mt-4">RELEASE OF LIABILITY</p>
                <p>
                  You hereby release and hold harmless Vellera, EDS, Asaad Morman, and all affiliated parties from any and all claims, damages, or liability arising from your use of the App, your participation in physical training, or any injury or death resulting from your use of the App's content.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Subscription, Billing & Auto-Renewal</h2>

            <h3 className="text-lg font-bold text-vellera-blue mb-2">3.1 Free Trial</h3>
            <p>
              New users are eligible for a 7-day free trial period ("Free Trial"). During the Free Trial, you will have full access to all Vellera premium features at no cost. No payment method is required to activate the Free Trial.
            </p>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">3.2 Paid Subscription & Auto-Renewal</h3>
            <p>
              At the end of your Free Trial period, your subscription will automatically convert to a paid recurring subscription plan ("Paid Subscription") unless you cancel before the end of the trial period. Available subscription plans include:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li><strong>Monthly Plan:</strong> [Insert Monthly Price]/month, billed monthly</li>
              <li><strong>Annual Plan:</strong> [Insert Annual Price]/year, billed annually</li>
            </ul>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">3.3 Billing</h3>
            <p>
              Subscription charges will be billed to the payment method you provide (Apple App Store, Google Play Store, or direct card payment). Your subscription will automatically renew on the same date each billing period unless canceled. Billing is non-refundable except as required by law.
            </p>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">3.4 Cancellation & Refunds</h3>
            <p>
              You may cancel your subscription at any time directly within the App settings, through your Apple ID account settings, or through your Google Play account settings. Cancellations take effect at the end of your current billing period. <strong>No refunds will be issued for partial months or unused portions of your subscription.</strong> If you cancel after your Free Trial but before your first paid charge, you will not be charged. If you are charged and wish to dispute a charge, please contact [Insert Support Email] within 30 days.
            </p>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">3.5 Price Changes</h3>
            <p>
              We reserve the right to change subscription pricing with 30 days' notice. If you do not agree to a price increase, you may cancel your subscription before the new pricing takes effect.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Intellectual Property Rights</h2>

            <h3 className="text-lg font-bold text-vellera-blue mb-2">4.1 Vellera Brand & Trademarks</h3>
            <p>
              The "Vellera" name, logo, and all associated branding are registered trademarks of Emerging Defense Solutions LLC. The slogan "Your Pace. Your Progress. Your Vellera." is proprietary intellectual property of EDS. You may not use these marks without express written permission.
            </p>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">4.2 Workout Content & Routines</h3>
            <p>
              All custom workout routines, training protocols, video content, exercise descriptions, and coaching cues in the App are proprietary intellectual property of Emerging Defense Solutions LLC and are protected by copyright law. You may not reproduce, distribute, modify, or sell any portion of this content without explicit permission. You may only use the content for your personal, non-commercial training purposes.
            </p>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">4.3 User-Generated Content</h3>
            <p>
              If you submit any content to Vellera (feedback, comments, logs), you grant Vellera a non-exclusive, royalty-free license to use that content for product improvement and marketing purposes.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. User Conduct & Prohibited Uses</h2>
            <p>You agree NOT to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Use the App for any illegal purpose or in violation of any local, state, or federal law.</li>
              <li>Reproduce, copy, or distribute any App content, including workout routines or proprietary training protocols.</li>
              <li>Attempt to reverse-engineer, decompile, or hack the App or its servers.</li>
              <li>Share your account credentials or allow unauthorized access to your account.</li>
              <li>Use the App to harass, abuse, or harm other users.</li>
              <li>Spam or send unsolicited messages through the App.</li>
              <li>Use bots or automated tools to access the App without permission.</li>
              <li>Create multiple accounts to exploit the Free Trial offer.</li>
              <li>Misrepresent your age, identity, or credentials.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Third-Party Integrations</h2>
            <p>
              Vellera integrates with third-party services including Spotify, Apple Music, Apple Health, Google Fit, and Apple HealthKit. Your use of these integrations is governed by the terms and privacy policies of those services. Vellera is not responsible for any disruption, changes, or discontinuation of third-party services.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Disclaimer of Warranties</h2>
            <p>
              THE APP IS PROVIDED "AS-IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. VELLERA DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. VELLERA DOES NOT WARRANT THAT THE APP WILL BE ERROR-FREE, UNINTERRUPTED, OR SECURE.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Limitation of Liability</h2>
            <p>
              TO THE FULLEST EXTENT PERMITTED BY LAW, VELLERA AND EDS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE APP, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. YOUR SOLE REMEDY SHALL BE LIMITED TO THE AMOUNT PAID FOR YOUR SUBSCRIPTION IN THE PAST 12 MONTHS.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Vellera, EDS, and all team members from any claims, damages, or legal fees arising from your violation of these Terms of Service, your misuse of the App, or your infringement of any third-party rights.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Termination</h2>
            <p>
              Vellera reserves the right to terminate your account and access to the App if you violate these Terms of Service or engage in prohibited conduct. Termination is effective immediately upon notice.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Governing Law & Dispute Resolution</h2>
            <p>
              These Terms of Service are governed by the laws of [Insert State/Country]. Any dispute arising from these terms shall be resolved through binding arbitration, except that Vellera may pursue injunctive relief in court to protect its intellectual property. By using this App, you waive your right to a jury trial and class action lawsuit.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Changes to Terms</h2>
            <p>
              Vellera reserves the right to modify these Terms of Service at any time. Continued use of the App after changes are posted constitutes acceptance of the new terms. We will notify users of material changes via email or in-app notification.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. Contact & Support</h2>
            <p>
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-commander-surface border border-commander-border rounded-xl p-4 mt-4">
              <p><strong>Emerging Defense Solutions LLC</strong></p>
              <p>Email: [Insert Support Email]</p>
              <p>Website: [Insert Website URL]</p>
              <p>Address: [Insert Physical Address]</p>
            </div>
          </section>

          {/* Final Statement */}
          <section className="bg-vellera-blue/10 border border-vellera-blue/50 rounded-xl p-6 mt-12">
            <p className="text-center text-sm">
              <strong>By using Vellera, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service, including the medical liability waiver. You assume all risks associated with physical training and combat sports conditioning.</strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}