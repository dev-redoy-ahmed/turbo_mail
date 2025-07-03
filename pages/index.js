import { useState, useEffect } from 'react'
import axios from 'axios'
import moment from 'moment'
import io from 'socket.io-client'

export default function Home() {
  const [currentEmail, setCurrentEmail] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  const generateEmail = async () => {
    setIsLoading(true)
    try {
      // Request notification permission
      if (Notification.permission === 'default') {
        await Notification.requestPermission()
      }
      
      const response = await axios.post('/api/generate-email')
      setCurrentEmail(response.data)
      setMessages(response.data.messages || [])
    } catch (error) {
      console.error('Error generating email:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshMessages = async () => {
    if (!currentEmail) return
    
    try {
      const response = await axios.get(`/api/email/${currentEmail.id}`)
      setMessages(response.data.messages || [])
    } catch (error) {
      console.error('Error refreshing messages:', error)
    }
  }

  const copyToClipboard = async () => {
    if (currentEmail) {
      try {
        await navigator.clipboard.writeText(currentEmail.email)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  const simulateEmail = async () => {
    if (!currentEmail) return
    
    try {
      await axios.post(`/api/simulate-email/${currentEmail.id}`, {
        subject: 'Welcome to TurboMails!',
        sender: 'welcome@turbo-mails.com',
        content: 'Thank you for using our temporary email service. This is a test message to demonstrate the functionality.'
      })
      refreshMessages()
    } catch (error) {
      console.error('Error simulating email:', error)
    }
  }

  useEffect(() => {
    if (currentEmail) {
      setupSocket()
    }
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [currentEmail])

  const setupSocket = () => {
    const newSocket = io('http://localhost:5000')
    
    newSocket.on('connect', () => {
      console.log('Connected to server')
      setConnected(true)
      newSocket.emit('subscribe', currentEmail.id)
    })
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnected(false)
    })
    
    newSocket.on('new_message', (message) => {
      console.log('New message received:', message)
      setMessages(prev => [message, ...prev])
      // Show notification
      if (Notification.permission === 'granted') {
        new Notification('New Email Received!', {
          body: `From: ${message.sender}\nSubject: ${message.subject}`,
          icon: '/favicon.ico'
        })
      }
    })
    
    setSocket(newSocket)
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Turbo<span className="text-blue-500">Mails</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Fast, secure, and anonymous temporary email addresses
          </p>
          <p className="text-gray-500 mb-8">
            Protect your privacy with disposable email addresses that expire automatically
          </p>
        </div>

        {/* Email Generation Section */}
        <div className="max-w-4xl mx-auto">
          <div className="card mb-8">
            <div className="text-center">
              {!currentEmail ? (
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    Generate Your Temporary Email
                  </h2>
                  <button
                    onClick={generateEmail}
                    disabled={isLoading}
                    className="btn-primary text-lg px-8 py-3"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="loading-spinner mr-2 h-5 w-5"></div>
                        Generating...
                      </div>
                    ) : (
                      'Generate Email'
                    )}
                  </button>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    Your Temporary Email
                  </h2>
                  <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-mono text-blue-400">
                        {currentEmail.email}
                      </span>
                      <button
                        onClick={copyToClipboard}
                        className="btn-secondary ml-4"
                      >
                        {copySuccess ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    Expires: {moment(currentEmail.expiresAt).format('MMMM Do YYYY, h:mm:ss a')}
                  </div>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={generateEmail}
                      className="btn-secondary"
                    >
                      Generate New
                    </button>
                    <button
                      onClick={simulateEmail}
                      className="btn-primary"
                    >
                      Send Test Email
                    </button>
                    <button
                      onClick={refreshMessages}
                      className="btn-secondary"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Messages Section */}
          {currentEmail && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  Inbox ({messages.length} messages)
                  {connected ? (
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" title="Real-time connected">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" title="Disconnected">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0 0L5.636 18.364m12.728-12.728L18.364 18.364M1.394 9.393l6.364 6.364m0 0l6.364 6.364M9.758 14.243L21.213 2.787" />
                    </svg>
                  )}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    connected ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                  }`}>
                    {connected ? 'Live' : 'Offline'}
                  </span>
                </div>
              </div>
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No messages yet. Send an email to this address to see it here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white">{message.subject}</h4>
                        <span className="text-sm text-gray-500">
                          {moment(message.receivedAt).format('MMM D, h:mm A')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">From: {message.sender}</p>
                      <p className="text-gray-300">{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose TurboMails?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-blue-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Secure & Private</h3>
              <p className="text-gray-400">Your privacy is protected with anonymous temporary email addresses</p>
            </div>
            <div className="card text-center">
              <div className="text-blue-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-400">Generate temporary emails instantly without any registration</p>
            </div>
            <div className="card text-center">
              <div className="text-blue-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Auto-Expire</h3>
              <p className="text-gray-400">Emails automatically expire after 1 hour for maximum security</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}