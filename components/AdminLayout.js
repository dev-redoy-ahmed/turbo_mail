import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const [adminUser, setAdminUser] = useState(null)

  useEffect(() => {
    const user = localStorage.getItem('adminUser')
    if (user) {
      setAdminUser(JSON.parse(user))
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('adminUser')
    router.push('/admin')
  }

  // If on login page, don't show the admin navigation
  if (router.pathname === '/admin') {
    return (
      <div className="min-h-screen bg-black">
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Admin Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin/dashboard" className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-white">
                  Turbo<span className="text-blue-500">Mails</span>
                  <span className="text-sm text-gray-400 ml-2">Admin</span>
                </div>
              </Link>
              
              <div className="flex items-center space-x-6">
                <Link 
                  href="/admin/dashboard" 
                  className={`nav-link ${
                    router.pathname === '/admin/dashboard' ? 'nav-link-active' : ''
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/admin/emails" 
                  className={`nav-link ${
                    router.pathname === '/admin/emails' ? 'nav-link-active' : ''
                  }`}
                >
                  Emails
                </Link>
                <Link 
                  href="/admin/settings" 
                  className={`nav-link ${
                    router.pathname === '/admin/settings' ? 'nav-link-active' : ''
                  }`}
                >
                  Settings
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {adminUser && (
                <div className="text-sm text-gray-400">
                  Welcome, <span className="text-white">{adminUser.username}</span>
                </div>
              )}
              <Link href="/" className="btn-secondary text-sm">
                View Site
              </Link>
              <button onClick={logout} className="btn-danger text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Content */}
      <main>
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="text-gray-400 text-sm">
              © 2024 TurboMails Admin Panel. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-400">Version 1.0.0</span>
              <span className="text-gray-600">|</span>
              <Link href="/admin/help" className="text-gray-400 hover:text-white">
                Help
              </Link>
              <span className="text-gray-600">|</span>
              <Link href="/admin/support" className="text-gray-400 hover:text-white">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}