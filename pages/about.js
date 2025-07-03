export default function About() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              About TurboMails
            </h1>
            <p className="text-xl text-gray-400">
              Your privacy-first temporary email solution
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="card">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Our Mission
              </h2>
              <p className="text-gray-400 mb-4">
                At TurboMails, we believe that privacy is a fundamental right. Our mission is to provide 
                fast, secure, and anonymous temporary email addresses that protect your personal information 
                from spam, tracking, and unwanted communications.
              </p>
              <p className="text-gray-400">
                We built TurboMails to give you control over your digital footprint while maintaining 
                the convenience of email communication.
              </p>
            </div>

            <div className="card">
              <h2 className="text-2xl font-semibold text-white mb-4">
                How It Works
              </h2>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    1
                  </div>
                  <div>Generate a temporary email address instantly</div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    2
                  </div>
                  <div>Use it for registrations, downloads, or any service</div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    3
                  </div>
                  <div>Receive emails in real-time on our platform</div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    4
                  </div>
                  <div>Email automatically expires after 1 hour</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-12">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              Why Choose TurboMails?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">100% Anonymous</h3>
                <p className="text-gray-400 text-sm">No registration required. No personal information collected.</p>
              </div>
              <div className="text-center">
                <div className="bg-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
                <p className="text-gray-400 text-sm">Generate emails instantly and receive messages in real-time.</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Auto-Expire</h3>
                <p className="text-gray-400 text-sm">Emails automatically delete after 1 hour for maximum security.</p>
              </div>
            </div>
          </div>

          <div className="card text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-gray-400 mb-6">
              TurboMails is built using cutting-edge web technologies to ensure fast performance, 
              security, and reliability. Our platform is designed to handle high traffic while 
              maintaining user privacy and data security.
            </p>
            <div className="flex justify-center space-x-8 text-sm text-gray-500">
              <div>Next.js</div>
              <div>•</div>
              <div>Tailwind CSS</div>
              <div>•</div>
              <div>Express.js</div>
              <div>•</div>
              <div>Node.js</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}