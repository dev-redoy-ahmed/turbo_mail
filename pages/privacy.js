export default function Privacy() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="card space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Our Commitment to Privacy
              </h2>
              <p className="text-gray-400 mb-4">
                At TurboMails, we are committed to protecting your privacy. This Privacy Policy explains 
                how we collect, use, and safeguard your information when you use our temporary email service.
              </p>
              <p className="text-gray-400">
                <strong className="text-white">The short version:</strong> We collect minimal information, 
                store it temporarily, and automatically delete everything after a short period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">
                    Temporary Email Data
                  </h3>
                  <ul className="text-gray-400 space-y-2 ml-4">
                    <li>• Generated email addresses (automatically created, not personal)</li>
                    <li>• Received email messages and their content</li>
                    <li>• Timestamps of email creation and expiration</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">
                    Technical Information
                  </h3>
                  <ul className="text-gray-400 space-y-2 ml-4">
                    <li>• IP addresses (for security and abuse prevention)</li>
                    <li>• Browser type and version</li>
                    <li>• Device information</li>
                    <li>• Usage statistics (anonymized)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                What We DON'T Collect
              </h2>
              <ul className="text-gray-400 space-y-2 ml-4">
                <li>• Personal identification information</li>
                <li>• Real email addresses</li>
                <li>• Phone numbers</li>
                <li>• Names or addresses</li>
                <li>• Payment information (our service is free)</li>
                <li>• Cookies for tracking purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                How We Use Your Information
              </h2>
              <ul className="text-gray-400 space-y-2 ml-4">
                <li>• To provide the temporary email service</li>
                <li>• To deliver emails to your temporary inbox</li>
                <li>• To prevent abuse and maintain service security</li>
                <li>• To improve our service performance</li>
                <li>• To comply with legal obligations when required</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Data Retention and Deletion
              </h2>
              <div className="bg-green-900 border border-green-700 rounded-lg p-4 mb-4">
                <p className="text-green-300 font-semibold mb-2">
                  🔒 Automatic Data Deletion
                </p>
                <p className="text-green-200">
                  All temporary emails and their contents are automatically deleted after 1 hour. 
                  This is not just a policy – it's built into our system architecture.
                </p>
              </div>
              <ul className="text-gray-400 space-y-2 ml-4">
                <li>• Temporary emails expire after 1 hour</li>
                <li>• All email content is permanently deleted upon expiration</li>
                <li>• Technical logs are retained for 7 days maximum</li>
                <li>• No long-term storage of personal data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Data Sharing and Third Parties
              </h2>
              <p className="text-gray-400 mb-4">
                We do not sell, trade, or otherwise transfer your information to third parties. 
                The only exceptions are:
              </p>
              <ul className="text-gray-400 space-y-2 ml-4">
                <li>• When required by law or legal process</li>
                <li>• To protect our rights, property, or safety</li>
                <li>• To prevent fraud or abuse of our service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Security Measures
              </h2>
              <ul className="text-gray-400 space-y-2 ml-4">
                <li>• HTTPS encryption for all communications</li>
                <li>• Secure server infrastructure</li>
                <li>• Regular security audits and updates</li>
                <li>• No permanent storage of sensitive data</li>
                <li>• Rate limiting to prevent abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Your Rights
              </h2>
              <p className="text-gray-400 mb-4">
                Since we don't collect personal information and automatically delete all data, 
                traditional data rights (access, correction, deletion) are largely unnecessary. However:
              </p>
              <ul className="text-gray-400 space-y-2 ml-4">
                <li>• You can stop using our service at any time</li>
                <li>• Your data will be automatically deleted within 1 hour</li>
                <li>• You can contact us with any privacy concerns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Children's Privacy
              </h2>
              <p className="text-gray-400">
                Our service is not intended for children under 13. We do not knowingly collect 
                personal information from children under 13. If you believe we have collected 
                such information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Changes to This Policy
              </h2>
              <p className="text-gray-400">
                We may update this Privacy Policy from time to time. We will notify users of any 
                material changes by posting the new Privacy Policy on this page and updating the 
                "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Contact Us
              </h2>
              <p className="text-gray-400 mb-4">
                If you have any questions about this Privacy Policy or our practices, please contact us:
              </p>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-300">
                  Email: privacy@turbo-mails.com<br/>
                  Subject: Privacy Policy Inquiry
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}