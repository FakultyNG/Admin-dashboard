'use client'

import { createAds, createHomeAd, updateAds } from '@/api/adsSlice'
import PosterUploadGuide from '@/components/PosterUploadGuide'
import SafeImage from '@/components/SafeImage'
import { IAdsData } from '@/types/api/ads.types'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'

type Placement = 'general' | 'home_ad' | 'web' | 'mobile'
type Props = { ad?: IAdsData | null; onCancel: () => void; onSaved: () => void }

const placements: { value: Placement; label: string; help: string }[] = [
  { value: 'general', label: 'General', help: 'Rotating video placements across the app.' },
  { value: 'home_ad', label: 'Home Ads', help: 'Horizontal posters in Premium Ads on Home.' },
  { value: 'web', label: 'Web', help: 'Video campaigns for web placements.' },
  { value: 'mobile', label: 'Mobile', help: 'Video campaigns for mobile placements.' },
]

const localDateTime = (value: Date | string) => {
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

export default function AddComponent({ ad, onCancel, onSaved }: Props) {
  const editing = Boolean(ad)
  const [placement, setPlacement] = useState<Placement>(
    ad?.type === 'home_ad' ? 'home_ad' : ad?.type === 'web' || ad?.type === 'mobile' ? ad.type : 'general',
  )
  const [title, setTitle] = useState(ad?.title ?? '')
  const [brand, setBrand] = useState(ad?.brand ?? '')
  const [cta, setCta] = useState(ad?.cta ?? 'Learn More')
  const [link, setLink] = useState(ad?.link ?? '')
  const [start, setStart] = useState(localDateTime(ad?.start ?? new Date()))
  const [expiry, setExpiry] = useState(localDateTime(ad?.expiry ?? new Date(Date.now() + 604800000)))
  const [active, setActive] = useState(ad?.active ?? true)
  const [poster, setPoster] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const [preview, setPreview] = useState(ad?.photoUrl ?? '')
  const [saving, setSaving] = useState(false)
  const homeAd = placement === 'home_ad'

  useEffect(() => () => {
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview)
  }, [preview])

  const valid = useMemo(() => {
    const mediaReady = editing ? Boolean(preview) : Boolean(poster)
    const videoReady = homeAd || Boolean(video) || (editing && ad?.type !== 'home_ad')
    return Boolean(title.trim() && link.trim() && start && expiry && mediaReady && videoReady && (homeAd || (brand.trim() && cta.trim())))
  }, [ad?.type, brand, cta, editing, expiry, homeAd, link, poster, preview, start, title, video])

  const choosePoster = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast('Choose a JPG, PNG or WebP poster.', { type: 'error' })
      return
    }
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview)
    setPoster(file)
    setPreview(URL.createObjectURL(file))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!valid) return
    const startAt = new Date(start)
    const expireAt = new Date(expiry)
    if (expireAt <= startAt || expireAt <= new Date()) {
      toast('Expiry must be later than the start time and in the future.', { type: 'error' })
      return
    }
    try { new URL(link) } catch {
      toast('Enter a complete CTA link beginning with https://', { type: 'error' })
      return
    }

    setSaving(true)
    try {
      const form = new FormData()
      let response
      if (editing && ad) {
        form.append('data', JSON.stringify({ title: title.trim(), type: placement, brand: homeAd ? 'Home-Ads' : brand.trim(), link: link.trim(), cta: homeAd ? 'Learn More' : cta.trim(), duration: 0, start: startAt.toISOString(), expiry: expireAt.toISOString(), active }))
        if (poster) form.append('image', poster)
        if (video && !homeAd) form.append('video', video)
        response = await updateAds(ad._id, form)
      } else if (homeAd) {
        form.append('title', title.trim())
        form.append('link', link.trim())
        form.append('start', startAt.toISOString())
        form.append('expiry', expireAt.toISOString())
        form.append('active', String(active))
        if (poster) form.append('photo', poster)
        response = await createHomeAd(form)
      } else {
        form.append('data', JSON.stringify({ title: title.trim(), type: placement, brand: brand.trim(), link: link.trim(), cta: cta.trim(), duration: 0, start: startAt.toISOString(), expiry: expireAt.toISOString(), active }))
        if (poster) form.append('image', poster)
        if (video) form.append('video', video)
        response = await createAds(form)
      }
      if (!response.ok) {
        toast(response.data?.message || 'The campaign could not be saved.', { type: 'error' })
        return
      }
      toast(response.data?.message || (editing ? 'Campaign updated' : 'Campaign created'), { type: 'success' })
      onSaved()
    } catch (error) {
      toast(error instanceof Error ? error.message : 'The campaign could not be saved.', { type: 'error' })
    } finally { setSaving(false) }
  }

  return <form onSubmit={submit} className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#151922] shadow-2xl">
    <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
      <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-400">Campaign editor</p><h2 className="mt-1 text-xl font-semibold text-white">{editing ? `Edit ${ad?.title}` : 'Create an ad'}</h2><p className="mt-1 text-sm text-slate-400">Only fields used by the selected placement are shown.</p></div>
      <button type="button" onClick={onCancel} className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5">Cancel</button>
    </div>
    <div className="p-5 sm:p-7">
      <fieldset><legend className="text-sm font-semibold text-white">Placement</legend><div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{placements.map(item => <button key={item.value} type="button" onClick={() => setPlacement(item.value)} className={`rounded-xl border p-4 text-left transition ${placement === item.value ? 'border-red bg-red/10 ring-1 ring-red' : 'border-white/10 bg-black/20 hover:border-white/20'}`}><span className="block text-sm font-semibold text-white">{item.label}</span><span className="mt-1 block text-xs leading-5 text-slate-400">{item.help}</span></button>)}</div></fieldset>
      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <Field label="Campaign title" required><input value={title} onChange={event => setTitle(event.target.value)} className="ad-input" placeholder="e.g. Weekend premiere" /></Field>
        {!homeAd ? <Field label="Brand" required><input value={brand} onChange={event => setBrand(event.target.value)} className="ad-input" placeholder="Advertiser or campaign owner" /></Field> : null}
        <Field label="CTA link" required hint="Opens in Reeplay’s in-app browser."><input type="url" value={link} onChange={event => setLink(event.target.value)} className="ad-input" placeholder="https://example.com/offer" /></Field>
        {!homeAd ? <Field label="Button label" required><input value={cta} onChange={event => setCta(event.target.value)} className="ad-input" placeholder="Learn More" /></Field> : null}
        <Field label="Starts" required><input type="datetime-local" value={start} onChange={event => setStart(event.target.value)} className="ad-input [color-scheme:dark]" /></Field>
        <Field label="Expires" required hint="Expired ads are deleted automatically."><input type="datetime-local" min={start} value={expiry} onChange={event => setExpiry(event.target.value)} className="ad-input [color-scheme:dark]" /></Field>
      </div>
      <label className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3"><span><span className="block text-sm font-medium text-white">Campaign active</span><span className="block text-xs text-slate-400">Inactive campaigns stay saved but are not delivered.</span></span><input type="checkbox" checked={active} onChange={event => setActive(event.target.checked)} className="h-5 w-5 accent-red" /></label>
      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <Field label="Horizontal poster" required={!editing} hint={editing ? 'Choose a file only to replace the current poster.' : undefined}><input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => choosePoster(event.target.files?.[0])} className="ad-file" /><PosterUploadGuide orientation="landscape" />{preview ? <SafeImage src={preview} fallbackSrc="/adsManager/landscape_web.png" alt="Campaign poster preview" width={960} height={540} className="mt-4 aspect-video w-full rounded-xl object-cover" /> : null}</Field>
        {!homeAd ? <Field label="Video" required={!editing} hint={editing ? 'Leave empty to keep the current video.' : 'The video is prepared for adaptive streaming.'}><input type="file" accept="video/*" onChange={event => setVideo(event.target.files?.[0] ?? null)} className="ad-file" />{video ? <p className="mt-3 truncate text-xs text-emerald-400">Selected: {video.name}</p> : null}</Field> : <div className="rounded-xl border border-dashed border-white/10 bg-black/10 p-5 text-sm leading-6 text-slate-400"><strong className="block text-white">Home Ads use one poster only</strong>No video, duration, subtitle, or duplicate artwork fields are required.</div>}
      </div>
      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-slate-300">Cancel</button><button disabled={!valid || saving} className="rounded-xl bg-red px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-red/20 disabled:cursor-not-allowed disabled:opacity-40">{saving ? 'Saving…' : editing ? 'Save changes' : 'Create campaign'}</button></div>
    </div>
  </form>
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return <label className="block text-sm text-slate-300"><span className="font-medium text-white">{label}{required ? <span className="ml-1 text-red-400">*</span> : null}</span>{hint ? <span className="ml-2 text-xs text-slate-500">{hint}</span> : null}<span className="mt-2 block">{children}</span></label>
}
