'use client'

import {
  downloadCampaignCsv,
  getCampaignAnalytics,
  getCampaignDeliveries,
  regenerateCampaignLink,
  sendCampaignReport,
} from '@/api/adsSlice'
import {IAdsData, ICampaignAnalytics} from '@/types/api/ads.types'
import {useCallback, useEffect, useState} from 'react'
import {toast} from 'react-toastify'

export default function CampaignAnalyticsPanel({ad, onClose}: {ad: IAdsData; onClose: () => void}) {
  const [days, setDays] = useState(30)
  const [analytics, setAnalytics] = useState<ICampaignAnalytics | null>(null)
  const [deliveries, setDeliveries] = useState<Array<{_id: string; recipient: string; delivery: string; frequency: string; status: string; sentAt?: string; error?: string; createdAt: string}>>([])
  const [reportLink, setReportLink] = useState(ad.reportLink ?? '')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [analyticsResponse, deliveryResponse] = await Promise.all([
      getCampaignAnalytics(ad._id, days),
      getCampaignDeliveries(ad._id),
    ])
    if (analyticsResponse.ok && analyticsResponse.data) setAnalytics(analyticsResponse.data.data)
    else toast(analyticsResponse.data?.message || 'Campaign analytics could not be loaded.', {type: 'error'})
    if (deliveryResponse.ok && deliveryResponse.data) setDeliveries(deliveryResponse.data.data)
    setLoading(false)
  }, [ad._id, days])

  useEffect(() => { void load() }, [load])

  const sendNow = async () => {
    setSending(true)
    const response = await sendCampaignReport(ad._id)
    setSending(false)
    if (!response.ok) return toast(response.data?.message || 'Report delivery failed.', {type: 'error'})
    toast('Campaign report delivery completed.', {type: 'success'})
    void load()
  }

  const regenerate = async () => {
    if (!window.confirm('Regenerate this link? The previous advertiser link will stop working immediately.')) return
    const response = await regenerateCampaignLink(ad._id)
    if (!response.ok || !response.data?.data) return toast(response.data?.message || 'Link could not be regenerated.', {type: 'error'})
    setReportLink(response.data.data.reportLink)
    toast('A new private report link was generated.', {type: 'success'})
  }

  const copyLink = async () => {
    if (!reportLink) return
    await navigator.clipboard.writeText(reportLink)
    toast('Live analytics link copied.', {type: 'success'})
  }

  return <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
    <div className="mx-auto my-6 max-w-6xl rounded-2xl border border-white/10 bg-[#11141b] shadow-2xl">
      <div className="flex flex-col gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-400">Campaign analytics</p><h2 className="mt-1 text-2xl font-semibold text-white">{ad.title}</h2><p className="mt-1 text-sm text-slate-400">{ad.brand} · aggregate data only</p></div>
        <div className="flex gap-2"><select value={days} onChange={event => setDays(Number(event.target.value))} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option><option value={400}>All retained data</option></select><button onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300">Close</button></div>
      </div>

      <div className="p-6">
        {loading ? <p className="py-16 text-center text-sm text-slate-400">Loading campaign analytics…</p> : analytics ? <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <Metric label="Impressions" value={analytics.summary.impressions} />
            <Metric label="Unique viewers" value={analytics.summary.uniqueViewers} />
            <Metric label="Clicks" value={analytics.summary.clicks} />
            <Metric label="CTR" value={`${analytics.summary.ctr}%`} />
            <Metric label="Video starts" value={analytics.summary.videoStarts} />
            <Metric label="Completion" value={`${analytics.summary.completionRate}%`} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-white/10 bg-black/20 p-5"><h3 className="font-semibold text-white">Video funnel</h3><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="25%" value={analytics.summary.video25} compact /><Metric label="50%" value={analytics.summary.video50} compact /><Metric label="75%" value={analytics.summary.video75} compact /><Metric label="Completed" value={analytics.summary.videoCompletions} compact /></div></section>
            <section className="rounded-2xl border border-white/10 bg-black/20 p-5"><h3 className="font-semibold text-white">Advertiser delivery</h3><p className="mt-2 text-sm text-slate-400">{ad.reportDelivery === 'live_link' ? 'Secure live analytics link' : ad.reportDelivery === 'csv' ? 'Scheduled CSV attachment' : 'Automatic reporting is off'}{ad.reportDelivery !== 'none' ? ` · ${ad.reportFrequency}` : ''}</p><p className="mt-1 break-all text-xs text-slate-500">{ad.advertiserEmails?.join(', ') || 'No advertiser email'}</p><div className="mt-4 flex flex-wrap gap-2"><button disabled={ad.reportDelivery === 'none' || sending} onClick={() => void sendNow()} className="rounded-lg bg-red px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">{sending ? 'Sending…' : 'Send now'}</button><button onClick={() => void downloadCampaignCsv(ad._id, ad.title, days)} className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-slate-200">Export CSV</button></div></section>
          </div>

          {ad.reportDelivery === 'live_link' ? <section className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-5"><h3 className="font-semibold text-white">Private live report link</h3><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input readOnly value={reportLink} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-slate-300" /><button onClick={() => void copyLink()} disabled={!reportLink} className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">Copy</button><button onClick={() => void regenerate()} className="rounded-lg border border-red-500/20 px-4 py-2 text-xs font-semibold text-red-400">Regenerate</button></div><p className="mt-2 text-xs text-slate-500">Regenerating immediately revokes the old link.</p></section> : null}

          <section className="mt-6 overflow-hidden rounded-2xl border border-white/10"><div className="border-b border-white/10 bg-white/[0.03] px-5 py-4"><h3 className="font-semibold text-white">Placement performance</h3></div><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Placement</th><th>Impressions</th><th>Clicks</th><th>CTR</th><th>Starts</th><th>Completed</th></tr></thead><tbody>{analytics.placements.map(row => <tr key={row.placement} className="border-t border-white/5"><td className="px-5 py-3 text-white">{row.placement}</td><td>{row.impressions}</td><td>{row.clicks}</td><td>{row.ctr}%</td><td>{row.starts}</td><td>{row.completions}</td></tr>)}</tbody></table>{!analytics.placements.length ? <p className="py-8 text-center text-sm text-slate-500">No campaign activity in this period.</p> : null}</div></section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-white/10"><div className="border-b border-white/10 bg-white/[0.03] px-5 py-4"><h3 className="font-semibold text-white">Delivery history</h3></div><div className="divide-y divide-white/5">{deliveries.map(item => <div key={item._id} className="grid gap-1 px-5 py-4 text-sm sm:grid-cols-[1fr_auto_auto]"><div><p className="text-white">{item.recipient}</p><p className="text-xs text-slate-500">{item.delivery.replace('_', ' ')} · {item.frequency}</p>{item.error ? <p className="mt-1 text-xs text-red-400">{item.error}</p> : null}</div><span className={item.status === 'sent' ? 'text-emerald-400' : item.status === 'failed' ? 'text-red-400' : 'text-amber-300'}>{item.status}</span><span className="text-xs text-slate-500">{new Date(item.sentAt ?? item.createdAt).toLocaleString()}</span></div>)}{!deliveries.length ? <p className="py-8 text-center text-sm text-slate-500">No report has been delivered yet.</p> : null}</div></section>
        </> : null}
      </div>
    </div>
  </div>
}

function Metric({label, value, compact = false}: {label: string; value: string | number; compact?: boolean}) {
  return <div className={`${compact ? 'rounded-xl p-3' : 'rounded-2xl p-4'} border border-white/10 bg-[#151922]`}><p className={`${compact ? 'text-lg' : 'text-2xl'} font-semibold text-white`}>{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>
}
