import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="bg-vellera-dark min-h-screen text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link to="/landing" className="flex items-center gap-2 text-vellera-blue hover:text-vellera-green transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-5xl font-black mb-2">Privacy Policy</h1>
          <p className="text-gray-400">Vellera Fitness & Combat Sports Application</p>
          <p className="text-gray-500 text-sm mt-2">Last Updated: [Insert Date]</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-300 leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p>
              Emerging Defense Solutions LLC ("Vellera," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and otherwise process personal information and sensitive data through our Vellera mobile application ("App"). This policy complies with applicable privacy laws, including the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and Apple App Store and Google Play Store requirements.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Health & Biometric Data</h2>

            <h3 className="text-lg font-bold text-vellera-blue mb-2">2.1 What Data We Collect</h3>
            <p>
              When you authorize Vellera to access Apple Health, Google Fit, or Apple HealthKit, we may collect the following biometric and health data:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Heart rate and resting heart rate measurements</li>
              <li>Calories burned during workouts</li>
              <li>Workout duration and intensity</li>
              <li>Steps taken and distance traveled</li>
              <li>Sleep data and sleep quality metrics</li>
              <li>Weight and body composition measurements (if shared)</li>
              <li>Other biometric metrics you voluntarily share</li>
            </ul>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">2.2 How We Use Health Data</h3>
            <p>
              We use health and biometric data exclusively for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Personalizing your training recommendations within the App</li>
              <li>Tracking your workout performance and progress metrics</li>
              <li>Providing real-time coaching cues based on your heart rate and exertion</li>
              <li>Generating performance analytics and recovery insights</li>
              <li>Improving our algorithms to deliver better training experiences</li>
            </ul>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">2.3 Health Data Storage & Protection</h3>
            <p>
              All health and biometric data is stored securely on encrypted servers with industry-standard encryption (AES-256 or equivalent). We restrict access to this data to authorized employees on a need-to-know basis. We implement multi-factor authentication, regular security audits, and compliance monitoring to protect your sensitive information.
            </p>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">2.4 NO SALE OR SHARING OF HEALTH DATA</h3>
            <div className="bg-green-950/30 border border-green-800 rounded-xl p-4 mt-2">
              <p className="text-green-100 font-bold">
                ✓ VELLERA DOES NOT SELL, TRADE, OR DISCLOSE YOUR HEALTH DATA TO THIRD-PARTY DATA BROKERS, INSURANCE COMPANIES, EMPLOYERS, OR ANY OTHER COMMERCIAL ENTITIES.
              </p>
              <p className="text-green-100 mt-2">
                Your health information is never monetized. We will never sell or license your biometric data for marketing, research, or any other purpose without your explicit, written consent. Health data is treated with the highest level of confidentiality and is protected under HIPAA best practices.
              </p>
            </div>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">2.5 HIPAA Compliance</h3>
            <p>
              While Vellera is not a covered entity under the Health Insurance Portability and Accountability Act (HIPAA), we maintain HIPAA-level security standards and privacy practices for all health data. We encrypt all health information in transit and at rest, and we limit access to authorized personnel only.
            </p>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">2.6 Health Data Retention</h3>
            <p>
              Your health and biometric data will be retained for as long as your account is active. Upon account deletion (see Section 6), all health data will be permanently deleted from our servers within 30 days.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Third-Party Media APIs & Music Integration</h2>

            <h3 className="text-lg font-bold text-vellera-blue mb-2">3.1 Spotify & Apple Music Integration</h3>
            <p>
              Vellera integrates with Spotify and Apple Music to enable you to use your personal playlists and music library during workouts. When you authorize the App to access Spotify or Apple Music, we collect the following information:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Your Spotify or Apple Music account ID (not your password)</li>
              <li>Your playlist names and song metadata</li>
              <li>Your listening history (only if you authorize it)</li>
              <li>Your account email address</li>
            </ul>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">3.2 What We DO NOT Store</h3>
            <div className="bg-blue-950/30 border border-blue-800 rounded-xl p-4 mt-2">
              <p className="text-blue-100 font-bold">
                ✓ Vellera DOES NOT store your Spotify password, Apple Music password, or any authentication credentials.
              </p>
              <p className="text-blue-100 mt-2">
                We use industry-standard OAuth 2.0 authentication, which means we never have access to your streaming service passwords. Your credentials remain secure with Spotify and Apple Music.
              </p>
            </div>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">3.3 How We Use Music Data</h3>
            <p>
              We use music integration data exclusively to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Enable playback of your selected playlists during workouts</li>
              <li>Sync workout tempo and beat-matching to your music</li>
              <li>Analyze song tempo to recommend workouts (e.g., high BPM = high-intensity)</li>
              <li>Improve our music recommendation algorithm within the App</li>
            </ul>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">3.4 Third-Party Terms</h3>
            <p>
              Your use of Spotify and Apple Music integration is governed by Spotify's and Apple's respective privacy policies and terms of service. Vellera is not responsible for how Spotify or Apple Music collect, use, or share your data. Please review their privacy policies directly.
            </p>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">3.5 Revoking Access</h3>
            <p>
              You may revoke Vellera's access to your Spotify or Apple Music account at any time through your account settings on Spotify.com or Apple Music settings. Once access is revoked, we will no longer be able to access or sync your music data.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Other Data We Collect</h2>

            <h3 className="text-lg font-bold text-vellera-blue mb-2">4.1 Account Information</h3>
            <p>
              When you create a Vellera account, we collect:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Your name and email address</li>
              <li>Age and gender (optional, for personalization)</li>
              <li>Subscription and billing information (payment method)</li>
              <li>Your App login credentials</li>
            </ul>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">4.2 App Usage Data</h3>
            <p>
              We collect information about how you use the App to improve performance and user experience:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Which workouts you start, pause, or complete</li>
              <li>How long you spend in the App</li>
              <li>Which features you interact with</li>
              <li>Crash logs and error reports (to fix bugs)</li>
            </ul>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">4.3 Device Information</h3>
            <p>
              We collect technical information about your device:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Device model and operating system version</li>
              <li>App version number</li>
              <li>IP address and network information</li>
              <li>Device identifiers (IDFA for iOS, AAID for Android)</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Analytics & Crash Reporting</h2>

            <h3 className="text-lg font-bold text-vellera-blue mb-2">5.1 Firebase Analytics & Crashlytics</h3>
            <p>
              Vellera uses Google Firebase (including Firebase Analytics and Crashlytics) to monitor app performance, track user behavior, and identify and fix crashes. Firebase may collect:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>App usage analytics (which features are used, session duration)</li>
              <li>Crash logs and error diagnostics (to improve stability)</li>
              <li>Device and OS information</li>
              <li>Engagement metrics</li>
            </ul>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">5.2 Firebase Privacy</h3>
            <p>
              Firebase analytics data is processed according to Google's privacy policy. Vellera does not share this data with third parties for marketing purposes. Firebase data is used exclusively for app improvement and bug fixing. You can opt out of analytics collection in your device settings (Limit Ad Tracking for iOS, Opt Out of Ads Personalization for Android).
            </p>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">5.3 Opt-Out</h3>
            <p>
              To disable analytics collection, you may:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li><strong>iOS:</strong> Go to Settings > Privacy > Apple Advertising > Turn off Personalized Ads</li>
              <li><strong>Android:</strong> Go to Settings > Google > Manage Your Google Account > Data & Privacy > Ad Settings > Opt Out of Ads Personalization</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Data Deletion Rights & Account Termination</h2>

            <h3 className="text-lg font-bold text-vellera-blue mb-2">6.1 How to Delete Your Account</h3>
            <div className="bg-orange-950/30 border border-orange-800 rounded-xl p-4 mt-2">
              <p className="text-orange-100 font-bold">
                ✓ VELLERA ALLOWS FULL ACCOUNT DELETION DIRECTLY WITHIN THE APP
              </p>
              <p className="text-orange-100 mt-4 font-bold">To permanently delete your account and all associated data:</p>
              <ol className="list-decimal list-inside space-y-2 ml-2 mt-2">
                <li>Open the Vellera App</li>
                <li>Go to <strong>Settings</strong> (gear icon)</li>
                <li>Scroll down to <strong>Account Management</strong></li>
                <li>Select <strong>Delete My Account</strong></li>
                <li>Confirm deletion by entering your password</li>
                <li>Your account and all data will be permanently deleted within 30 days</li>
              </ol>
            </div>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">6.2 What Gets Deleted</h3>
            <p>
              When you delete your account, the following data is permanently removed:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Your name, email, and account credentials</li>
              <li>All health and biometric data associated with your account</li>
              <li>All workout logs, performance metrics, and training history</li>
              <li>Subscription and billing information (payment records are retained only for tax compliance)</li>
              <li>All personal settings and preferences</li>
            </ul>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">6.3 Retention After Deletion</h3>
            <p>
              Vellera will retain encrypted backups of deleted data for up to 30 days to ensure data integrity and prevent accidental loss. After 30 days, all data is permanently purged from our systems and cannot be recovered. Payment records required for tax compliance (invoices, transaction IDs) may be retained for 7 years as required by law, but are not linked to your personal identity.
            </p>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">6.4 Subscription Cancellation vs. Account Deletion</h3>
            <p>
              <strong>Canceling your subscription</strong> stops your recurring charges but does not delete your account or data. <strong>Deleting your account</strong> is permanent and removes all your data from Vellera's systems. You must manually delete your account if you wish to have your data removed.
            </p>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">6.5 Data Subject Rights (GDPR/CCPA)</h3>
            <p>
              In addition to account deletion, you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li><strong>Access:</strong> Request a copy of all personal data Vellera holds about you</li>
              <li><strong>Correction:</strong> Correct inaccurate data through App settings or by contacting support</li>
              <li><strong>Deletion:</strong> Request deletion of your data (see Section 6.1)</li>
              <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
              <li><strong>Opt-Out:</strong> Opt out of marketing communications at any time</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, email [Insert Support Email] with your request.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Cookies & Tracking Technologies</h2>

            <h3 className="text-lg font-bold text-vellera-blue mb-2">7.1 Cookies</h3>
            <p>
              Vellera's mobile App does not use traditional HTTP cookies (since mobile apps don't have browsers). However, we may use local storage mechanisms to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Keep you logged in to your account</li>
              <li>Remember your preferences and settings</li>
              <li>Cache data for faster loading</li>
            </ul>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">7.2 Device Identifiers & Advertising</h3>
            <p>
              We may use device identifiers (IDFA for iOS, AAID for Android) to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Track in-app advertising performance and conversion rates</li>
              <li>Provide personalized ads within the App</li>
              <li>Prevent fraud and abuse</li>
            </ul>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">7.3 Opt Out of Personalized Advertising</h3>
            <p>
              You can disable personalized advertising on your device by enabling "Limit Ad Tracking" (iOS) or "Opt Out of Ads Personalization" (Android) in your device settings.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Data Sharing & Disclosure</h2>

            <h3 className="text-lg font-bold text-vellera-blue mb-2">8.1 When We Share Your Data</h3>
            <p>
              Vellera may share your data only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li><strong>Service Providers:</strong> With payment processors (Apple, Google) and analytics providers (Firebase) to provide App services</li>
              <li><strong>Legal Compliance:</strong> If required by law, court order, or government authority</li>
              <li><strong>Safety:</strong> To protect the safety and security of the App and its users</li>
              <li><strong>Business Transfer:</strong> If Vellera is acquired or merged, your data may be transferred as part of that transaction</li>
            </ul>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">8.2 We DO NOT Sell Your Data</h3>
            <p>
              <strong>Vellera does not sell, rent, or trade your personal data or health information to third parties.</strong> We do not share your data with marketing companies, data brokers, or any other commercial entities without your explicit consent.
            </p>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">8.3 International Data Transfers</h3>
            <p>
              If your data is transferred internationally, it will be protected under standard contractual clauses, adequacy decisions, or your explicit consent. Your data is always processed according to the privacy laws of your jurisdiction.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Data Security</h2>

            <h3 className="text-lg font-bold text-vellera-blue mb-2">9.1 Encryption & Protection</h3>
            <p>
              Vellera implements the following security measures to protect your data:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>All data in transit is encrypted using HTTPS/TLS protocols (minimum TLS 1.2)</li>
              <li>All data at rest is encrypted using AES-256 encryption or equivalent</li>
              <li>Database access is restricted to authorized personnel with multi-factor authentication</li>
              <li>Regular security audits and penetration testing</li>
              <li>Compliance with industry standards (ISO 27001, SOC 2 Type II)</li>
            </ul>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">9.2 Limitation of Liability</h3>
            <p>
              While we implement strong security measures, no system is 100% secure. Vellera is not liable for unauthorized access to your data due to factors beyond our reasonable control (e.g., compromised passwords, device theft).
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Children's Privacy</h2>

            <h3 className="text-lg font-bold text-vellera-blue mb-2">10.1 Age Restriction</h3>
            <p>
              Vellera is intended for users 18 years of age and older. We do not knowingly collect personal data from children under 13 (or the applicable age of digital consent in your jurisdiction). If we become aware that we have collected data from a child under 13, we will delete that data immediately.
            </p>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">10.2 Parental Consent</h3>
            <p>
              For users ages 13–17, parental consent may be required. Parents or guardians who wish to review, correct, or delete their child's data should contact [Insert Support Email].
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Changes to This Privacy Policy</h2>
            <p>
              Vellera may update this Privacy Policy from time to time. Material changes will be communicated to you via email or in-app notification. Your continued use of the App after changes are posted constitutes acceptance of the updated Privacy Policy.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, wish to exercise your data rights, or report a privacy concern, please contact:
            </p>
            <div className="bg-commander-surface border border-commander-border rounded-xl p-4 mt-4">
              <p><strong>Emerging Defense Solutions LLC</strong></p>
              <p>Email: [Insert Support Email]</p>
              <p>Data Protection Officer: [Insert DPO Email]</p>
              <p>Website: [Insert Website URL]</p>
              <p>Address: [Insert Physical Address]</p>
            </div>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">12.1 GDPR Data Protection Authority</h3>
            <p>
              If you are located in the European Union and have concerns about our privacy practices, you have the right to lodge a complaint with your local Data Protection Authority.
            </p>

            <h3 className="text-lg font-bold text-vellera-blue mb-2 mt-4">12.2 California Privacy Rights</h3>
            <p>
              California residents have specific rights under the CCPA. For a detailed explanation of your rights and how to exercise them, visit our California Privacy Notice at [Insert Link].
            </p>
          </section>

          {/* Final Statement */}
          <section className="bg-vellera-green/10 border border-vellera-green/50 rounded-xl p-6 mt-12">
            <p className="text-center text-sm">
              <strong>Your privacy is our priority. By using Vellera, you trust us with your personal and health data. We take that responsibility seriously and are committed to protecting your information with the highest standards of security and transparency.</strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}