import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import moment from 'moment'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [emails, setEmails] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEmail, setSelectedEmail] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const adminUser = localStorage.getItem('adminUser')
    if (!adminUser) {
      router.push('/admin')
      return
    }

    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsResponse, emailsResponse] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/emails')
      ])
      
      setStats(statsResponse.data)
      setEmails(emailsResponse.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteEmail = async (emailId) => {
    if (!confirm('Are you sure you want to delete this email?')) return

    try {
      await axios.delete(`/api/admin/email/${emailId}`)
      setEmails(emails.filter(email => email.id !== emailId))
      setSelectedEmail(null)
      fetchData() // Refresh stats
    } catch (error) {
      console.error('Error deleting email:', error)
    }
  }

  const logout = () => {
    localStorage.removeItem('adminUser')
    router.push('/admin')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-400">
              Manage temporary emails and monitor system activity
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/')}
              className="btn-secondary"
            >
              View Site
            </button>
            <button
              onClick={logout}
              className="btn-danger"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">
                {stats.totalEmails}
              </div>
              <div className="text-gray-400">Total Emails</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">
                {stats.activeEmails}
              </div>
              <div className="text-gray-400">Active Emails</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-purple-500 mb-2">
                {stats.totalMessages}
              </div>
              <div className="text-gray-400">Total Messages</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-yellow-500 mb-2">
                {stats.todayEmails}
              </div>
              <div className="text-gray-400">Today's Emails</div>
            </div>
          </div>
        )}

        {/* Email Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Email List */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                Email Addresses ({emails.length})
              </h2>
              <button
                onClick={fetchData}
                className="btn-secondary text-sm"
              >
                Refresh
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {emails.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No emails found
                </div>
              ) : (
                emails.map((email) => (
                  <div
                    key={email.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedEmail?.id === email.id
                        ? 'bg-blue-900 border-blue-600'
                        : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                    }`}
                    onClick={() => setSelectedEmail(email)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-mono text-blue-400 text-sm mb-1">
                          {email.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          Created: {moment(email.createdAt).format('MMM D, h:mm A')}
                        </div>
                        <div className="text-xs text-gray-500">
                          Expires: {moment(email.expiresAt).format('MMM D, h:mm A')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          {email.messages.length} msgs
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          moment().isBefore(email.expiresAt)
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}>
                          {moment().isBefore(email.expiresAt) ? 'Active' : 'Expired'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Email Details */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-6">
              Email Details
            </h2>
            
            {selectedEmail ? (
              <div>
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                  <div className="font-mono text-blue-400 text-lg mb-2">
                    {selectedEmail.email}
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div>ID: {selectedEmail.id}</div>
                    <div>Created: {moment(selectedEmail.createdAt).format('MMMM Do YYYY, h:mm:ss a')}</div>
                    <div>Expires: {moment(selectedEmail.expiresAt).format('MMMM Do YYYY, h:mm:ss a')}</div>
                    <div>Messages: {selectedEmail.messages.length}</div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => deleteEmail(selectedEmail.id)}
                      className="btn-danger text-sm"
                    >
                      Delete Email
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Messages ({selectedEmail.messages.length})
                  </h3>
                  
                  {selectedEmail.messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No messages
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedEmail.messages.map((message) => (
                        <div key={message.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-semibold text-white text-sm">
                              {message.subject}
                            </div>
                            <div className="text-xs text-gray-500">
                              {moment(message.receivedAt).format('MMM D, h:mm A')}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 mb-2">
                            From: {message.sender}
                          </div>
                          <div className="text-sm text-gray-300">
                            {message.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p>Select an email to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}