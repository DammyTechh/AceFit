import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useStore } from './lib/store'
import './styles/globals.css'

import StoreFront   from './pages/StoreFront'
import OrdersPage   from './pages/OrdersPage'
import BlogPage     from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import GainzPage    from './pages/GainzPage'
import AdminLayout  from './pages/admin/AdminLayout'
import AdminDashboard    from './pages/admin/AdminDashboard'
import AdminProducts     from './pages/admin/AdminProducts'
import AdminOrders       from './pages/admin/AdminOrders'
import AdminTickets      from './pages/admin/AdminTickets'
import AdminCustomers    from './pages/admin/AdminCustomers'
import AdminFeedback     from './pages/admin/AdminFeedback'
import AdminSettings     from './pages/admin/AdminSettings'
import AdminBlog         from './pages/admin/AdminBlog'
import AdminDelivery     from './pages/admin/AdminDelivery'
import AdminPayments     from './pages/admin/AdminPayments'
import AdminHero         from './pages/admin/AdminHero'
import AdminBanners      from './pages/admin/AdminBanners'

function App() {
  const { theme } = useStore()
  useEffect(() => { document.documentElement.className = theme }, [theme])

  return (
    <div className={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/*"    element={<StoreFront />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/gainz"      element={<GainzPage />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index             element={<AdminDashboard />} />
            <Route path="products"   element={<AdminProducts />} />
            <Route path="orders"     element={<AdminOrders />} />
            <Route path="tickets"    element={<AdminTickets />} />
            <Route path="customers"  element={<AdminCustomers />} />
            <Route path="feedback"   element={<AdminFeedback />} />
            <Route path="settings"   element={<AdminSettings />} />
            <Route path="blog"       element={<AdminBlog />} />
            <Route path="delivery"   element={<AdminDelivery />} />
            <Route path="payments"   element={<AdminPayments />} />
            <Route path="hero"       element={<AdminHero />} />
            <Route path="banners"    element={<AdminBanners />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#fff',
            border: '1px solid #2A2A2A',
            borderRadius: '12px',
            fontFamily: 'DM Sans, sans-serif',
          },
          success: { iconTheme: { primary: '#FF6B00', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
