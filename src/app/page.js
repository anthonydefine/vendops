'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from './supabaseClient'

import { BackgroundBeams } from '../components/ui/shadcn-io/background-beams'

export default function HomePage() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) redirectUser(session.user.id)
      else setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) redirectUser(session.user.id)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const redirectUser = async (userId) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    if (!profile) return
    if (profile.role === 'admin') router.push('/admin')
    if (profile.role === 'driver') router.push('/driver')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    const email = e.target.email.value
    const password = e.target.password.value
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
  }

  if (loading) return <p className="p-6 text-center">Loading...</p>

  return (
    <main className="p-6 relative flex flex-col items-center justify-center min-h-screen">
      <BackgroundBeams />
      <div className="p-6 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl shadow-xl">
        <h1 className="text-3xl font-bold mb-6">VendOps Login</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-3 w-64">
          <input type="email" name="email" placeholder="Email" className="border p-2 rounded" />
          <input type="password" name="password" placeholder="Password" className="border p-2 rounded" />
          <button type="submit" className="bg-blue-600 text-white py-2 rounded">Log In</button>
        </form>
      </div>
    </main>
  )
}
