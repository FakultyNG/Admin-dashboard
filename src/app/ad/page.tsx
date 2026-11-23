'use client'

import { deleteAds, getAllAds } from '@/api/adsSlice'
import { RowCheckbox, SelectAllCheckbox } from '@/components/BulkSelect'
import { ADMIN_LIST_PAGE_SIZE, ListPagination } from '@/components/ListPagination'
import SafeImage from '@/components/SafeImage'
import { IAdsData } from '@/types/api/ads.types'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import AddComponent from './AddComponentAD'
import CampaignAnalyticsPanel from './CampaignAnalyticsPanel'

export const runtime = 'edge'

type StatusFilter = 'all' | 'active' | 'scheduled' | 'paused' | 'archived'

const placementLabel: Record<IAdsData['type'], string> = {
  general: 'General',
  web: 'Web',
  mobile: 'Mobile',
  home_ad: 'Home Ads',
  movie_ad: 'Legacy movie ad',
}

const campaignStatus = (ad: IAdsData) => {
  const now = Date.now()
  if (ad.archivedAt || new Date(ad.expiry).getTime() <= now) return 'archived' as const
  if (!ad.active) return 'paused' as const
  if (new Date(ad.start).getTime() > now) return 'scheduled' as const
  return 'active' as const
}

export default function AdsPage() {
  const [ads, setAds] = useState<IAdsData[]>([])
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [loading, setLoading] = useState(true)
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedAd, setSelectedAd] = useState<IAdsData | null>(null)
  const [analyticsAd, setAnalyticsAd] = useState<IAdsData | null>(null)

  const loadAds = useCallback(async (requestedPage = page) => {
    setLoading(true)
    try {
      const response = await getAllAds({ page: requestedPage, limit: ADMIN_LIST_PAGE_SIZE })
      if (!response.ok || !response.data) {
        toast(response.data?.message || 'Ads could not be loaded.', { type: 'error' })
        return
      }
      setAds(response.data.data ?? [])
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => { void loadAds(page) }, [loadAds, page])

  const filteredAds = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return ads.filter(ad => {
      const matchesQuery = !normalized || [ad.title, ad.brand, ad.type].some(value => value?.toLowerCase().includes(normalized))
      const matchesStatus = status === 'all' || campaignStatus(ad) === status
      return matchesQuery && matchesStatus
    })
  }, [ads, query, status])

  const counts = useMemo(() => ({
    total: ads.length,
    active: ads.filter(ad => campaignStatus(ad) === 'active').length,
    scheduled: ads.filter(ad => campaignStatus(ad) === 'scheduled').length,
    mobile: ads.filter(ad => ad.type === 'mobile').length,
  }), [ads])

  const openCreate = () => { setSelectedAd(null); setEditorOpen(true) }
  const openEdit = (ad: IAdsData) => { setSelectedAd(ad); setEditorOpen(true) }
  const closeEditor = () => { setEditorOpen(false); setSelectedAd(null) }

  const remove = async (ad: IAdsData) => {
    if (!window.confirm(`Delete “${ad.title}”? Its poster and video will also be removed.`)) return
    const previous = ads
    setAds(current => current.filter(item => item._id !== ad._id))
    const response = await deleteAds(ad._id)
    if (!response.ok) {
      setAds(previous)
      toast(response.data?.message || 'The campaign could not be deleted.', { type: 'error' })
      return
    }
    toast('Campaign deleted.', { type: 'success' })
  }

  return <section className="relative h-full overflow-y-auto px-5 pb-12 lg:px-8">
    {analyticsAd ? <CampaignAnalyticsPanel ad={analyticsAd} onClose={() => setAnalyticsAd(null)} /> : null}
    <div className="flex flex-col gap-4 border-b border-white/10 py-6 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-400">Campaign management</p><h1 className="mt-2 text-2xl font-semibold text-white">Ad Manager</h1><p className="mt-1 max-w-2xl text-sm text-slate-400">Create, schedule, edit, pause, and remove every Reeplay ad placement from one workspace.</p></div>
      {!editorOpen ? <button type="button" onClick={openCreate} className="rounded-xl bg-red px-5 py-3 text-sm font-semibold text-white">+ New campaign</button> : null}
    </div>

    {editorOpen ? <AddComponent key={selectedAd?._id ?? 'new'} ad={selectedAd} onCancel={closeEditor} onSaved={() => { closeEditor(); void loadAds(page) }} /> : <>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Campaigns on this page" value={counts.total} />
        <Metric label="Live now" value={counts.active} tone="text-emerald-400" />
        <Metric label="Scheduled" value={counts.scheduled} tone="text-amber-300" />
        <Metric label="Mobile campaigns" value={counts.mobile} tone="text-sky-300" />
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#151922] p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1"><Image src="/searchIcon.svg" alt="" width={17} height={17} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-60" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search title, brand, or placement" className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none" /></div>
        <select value={status} onChange={event => setStatus(event.target.value as StatusFilter)} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white"><option value="all">All statuses</option><option value="active">Live now</option><option value="scheduled">Scheduled</option><option value="paused">Paused</option><option value="archived">Archived</option></select>
        <button type="button" onClick={() => void loadAds(page)} disabled={loading} className="rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 disabled:opacity-50">{loading ? 'Refreshing…' : 'Refresh'}</button>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-[#11141b]">
        <table className="w-full min-w-[980px]">
          <thead className="bg-white/[0.035] text-left text-xs uppercase tracking-[0.12em] text-slate-500"><tr><th className="w-12 px-4 py-4"><SelectAllCheckbox group="ads" /></th><th className="px-4 py-4">Campaign</th><th className="px-4 py-4">Placement</th><th className="px-4 py-4">Schedule</th><th className="px-4 py-4">Status</th><th className="px-4 py-4 text-right">Actions</th></tr></thead>
          <tbody>{filteredAds.map(ad => {
            const currentStatus = campaignStatus(ad)
            return <tr key={ad._id} className="border-t border-white/[0.07] text-sm text-white hover:bg-white/[0.025]">
              <td className="px-4 py-4"><RowCheckbox group="ads" value={ad._id} label={`Select ${ad.title}`} /></td>
              <td className="px-4 py-4"><div className="flex items-center gap-3"><SafeImage src={ad.photoUrl} fallbackSrc="/adsManager/landscape_web.png" alt="" width={112} height={63} className="aspect-video w-24 rounded-lg object-cover" /><div className="min-w-0"><p className="max-w-[250px] truncate font-semibold">{ad.title}</p><p className="mt-1 max-w-[250px] truncate text-xs text-slate-500">{ad.brand}</p></div></div></td>
              <td className="px-4 py-4"><span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">{placementLabel[ad.type] ?? ad.type}</span></td>
              <td className="px-4 py-4"><p>{new Date(ad.start).toLocaleString()}</p><p className="mt-1 text-xs text-slate-500">to {new Date(ad.expiry).toLocaleString()}</p></td>
              <td className="px-4 py-4"><StatusBadge status={currentStatus} /></td>
              <td className="px-4 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => setAnalyticsAd(ad)} className="rounded-lg border border-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10">Analytics</button><button type="button" onClick={() => openEdit(ad)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5">Edit</button><button type="button" onClick={() => void remove(ad)} className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10">Delete</button></div></td>
            </tr>
          })}</tbody>
        </table>
        {!loading && filteredAds.length === 0 ? <div className="px-6 py-16 text-center"><p className="font-medium text-white">No campaigns found</p><p className="mt-2 text-sm text-slate-500">Adjust the filters or create a new campaign.</p></div> : null}
      </div>
      <ListPagination page={page} itemCount={ads.length} isLoading={loading} onPageChange={setPage} />
    </>}
  </section>
}

function Metric({ label, value, tone = 'text-white' }: { label: string; value: number; tone?: string }) {
  return <div className="rounded-2xl border border-white/10 bg-[#151922] p-4"><p className="text-xs text-slate-500">{label}</p><p className={`mt-2 text-2xl font-semibold ${tone}`}>{value}</p></div>
}

function StatusBadge({ status }: { status: 'active' | 'scheduled' | 'paused' | 'archived' }) {
  const styles = status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : status === 'scheduled' ? 'bg-amber-500/10 text-amber-300' : status === 'archived' ? 'bg-purple-500/10 text-purple-300' : 'bg-slate-500/10 text-slate-400'
  return <span className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${styles}`}>{status === 'active' ? 'Live now' : status}</span>
}
