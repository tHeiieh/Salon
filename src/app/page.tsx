import { redirect } from 'next/navigation'

// Root redirects to main platform page or login
export default function RootPage() {
  redirect('/dashboard')
}
