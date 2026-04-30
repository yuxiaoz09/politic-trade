import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { getUserSubscriptions } from '@/lib/db/queries/subscriptions'
import { SubscriptionForm } from '@/components/alerts/SubscriptionForm'
import { SubscriptionList } from '@/components/alerts/SubscriptionList'

export default async function AlertsPage() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')?.value
  if (!sessionId) redirect('/login')

  const user = await getSessionUser(sessionId)
  if (!user) redirect('/login')

  const subscriptions = await getUserSubscriptions(user.id)

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-600 mb-1">Alert Subscriptions</h1>
        <p className="text-xs font-mono text-zinc-700">
          Receive email alerts when politicians make new trade disclosures
        </p>
      </div>

      <SubscriptionForm />

      <div>
        <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-3">
          Your Alerts ({subscriptions.length})
        </div>
        <SubscriptionList subscriptions={subscriptions} />
      </div>
    </div>
  )
}
