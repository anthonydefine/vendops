'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../supabaseClient'

import ManageDashboard from './components/ManageDashboard'
import ManageDrivers from './components/ManageDrivers'
import ManageMaintenance from './components/ManageMaintenance'
import PushSubscribe from '../components/PushSubscribe'

function LogoutButton() {
  const router = useRouter()
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }
  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded"
    >
      Log Out
    </button>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const tabs = ['dashboard', 'inventory', 'maintenance', 'drivers']

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/')
      setSession(session)

      const { data } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', session.user.id)
        .single()
      setProfile(data)
    }
    fetchSession()
  }, [router])

  if (!session || !profile) return <p className="p-6">Loading...</p>

  return (
    <>
      <div className="min-h-screen">
        {/* Header */}
        <header className="shadow p-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{profile.full_name}</h1>
            <p className="text-sm text-gray-500">{profile.role}</p>
          </div>
          <LogoutButton />
          <PushSubscribe />
        </header>

        {/* Tabs */}
        <nav className="flex space-x-4 p-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main className="p-6">
          {activeTab === "dashboard" && (
            <ManageDashboard setActiveTab={setActiveTab} />
          )}
          {activeTab === 'maintenance' && <MaintenanceTab />}
          {activeTab === 'drivers' && <DriversTab />}
          {activeTab === 'inventory' && <p>Inventory coming soon...</p>}
        </main>
      </div>
    </>
    
  )
}

/* ------------------ Maintenance Tab Placeholder ------------------ */
function MaintenanceTab() {
  return (
    <ManageMaintenance />
  )
}

/* ------------------ Drivers Tab ------------------ */
function DriversTab() {
  

  return (
    <ManageDrivers />
  )
}
