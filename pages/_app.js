import '../styles/globals.css'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import MainLayout from '../components/MainLayout'

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if current route is admin
    const checkAdminRoute = () => {
      const isAdminRoute = router.pathname.startsWith('/admin')
      setIsAdmin(isAdminRoute)
      setIsLoading(false)
    }

    checkAdminRoute()
  }, [router.pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (isAdmin) {
    return (
      <AdminLayout>
        <Component {...pageProps} />
      </AdminLayout>
    )
  }

  return (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  )
}