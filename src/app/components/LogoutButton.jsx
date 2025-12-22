import supabase from '../supabaseClient'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) alert(error.message)
    else router.push('/') // redirect back to login page
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full py-1 rounded"
    >
      Log Out
    </button>
  )
}
