'use client'

import {createAds, updateAds} from '@/api/adsSlice'
import PosterUploadGuide from '@/components/PosterUploadGuide'
import SafeImage from '@/components/SafeImage'
import {IAdsData} from '@/types/api/ads.types'
import {FormEvent, useEffect, useMemo, useState} from 'react'
import {toast} from 'react-toastify'

type Props = {ad?: IAdsData | null; onCancel: () => void; onSaved: () => void}
type Step = 'general' | 'mobile'

const localDateTime = (value: Date | string) => {
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

export default function AddComponent({ad, onCancel, onSaved}: Props) {
  const editing = Boolean(ad)
  const [step, setStep] = useState<Step>('general')
  const [title, setTitle] = useState(ad?.title ?? '')
  const [brand, setBrand] = useState(ad?.brand ?? '')
  const [cta, setCta] = useState(ad?.cta ?? 'Learn More')
  const [link, setLink] = useState(ad?.link ?? '')
  const [start, setStart] = useState(localDateTime(ad?.start ?? new Date()))
  const [expiry, setExpiry] = useState(
    localDateTime(ad?.expiry ?? new Date(Date.now() + 604800000)),
  )
  const [active, setActive] = useState(ad?.active ?? true)
  const [advertiserEmails, setAdvertiserEmails] = useState((ad?.advertiserEmails ?? []).join(', '))
  const [reportDelivery, setReportDelivery] = useState<IAdsData['reportDelivery']>(ad?.reportDelivery ?? 'none')
  const [reportFrequency, setReportFrequency] = useState<IAdsData['reportFrequency']>(ad?.reportFrequency ?? 'weekly')
  const [reportTimezone, setReportTimezone] = useState(ad?.reportTimezone ?? 'Africa/Lagos')
  const [poster, setPoster] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const [preview, setPreview] = useState(ad?.photoUrl ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(
    () => () => {
      if (preview.startsWith('blob:')) URL.revokeObjectURL(preview)
    },
    [preview],
  )

  const generalValid = Boolean(
    title.trim() && brand.trim() && cta.trim() && link.trim() && start && expiry &&
      (reportDelivery === 'none' || advertiserEmails.trim()),
  )
  const mediaValid = Boolean(
    (editing ? preview : poster) &&
      (video || (editing && ad?.type !== 'home_ad' && Boolean(ad?.hasVideo || ad?.videoUrl))),
  )
  const valid = generalValid && mediaValid

  const choosePoster = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast('Choose a JPG, PNG or WebP poster.', {type: 'error'})
      return
    }
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview)
    setPoster(file)
    setPreview(URL.createObjectURL(file))
  }

  const validateGeneral = () => {
    if (!generalValid) {
      toast('Complete all General fields before continuing.', {type: 'error'})
      return false
    }
    const startAt = new Date(start)
    const expireAt = new Date(expiry)
    if (expireAt <= startAt || expireAt <= new Date()) {
      toast('Expiry must be later than the start time and in the future.', {type: 'error'})
      return false
    }
    try {
      new URL(link)
    } catch {
      toast('Enter a complete CTA link beginning with https://', {type: 'error'})
      return false
    }
    const emails = advertiserEmails.split(',').map(value => value.trim()).filter(Boolean)
    if (reportDelivery !== 'none' && (!emails.length || emails.some(email => !/^\S+@\S+\.\S+$/.test(email)))) {
      toast('Enter at least one valid advertiser email address.', {type: 'error'})
      return false
    }
    return true
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (step === 'general') {
      if (validateGeneral()) setStep('mobile')
      return
    }
    if (!validateGeneral() || !mediaValid) {
      toast('Add both the vertical welcome video and horizontal poster.', {type: 'error'})
      return
    }

    setSaving(true)
    try {
      const form = new FormData()
      form.append(
        'data',
        JSON.stringify({
          title: title.trim(),
          type: 'mobile',
          brand: brand.trim(),
          link: link.trim(),
          cta: cta.trim(),
          duration: 0,
          start: new Date(start).toISOString(),
          expiry: new Date(expiry).toISOString(),
          active,
          advertiserEmails: advertiserEmails.split(',').map(value => value.trim().toLowerCase()).filter(Boolean),
          reportDelivery,
          reportFrequency,
          reportTimezone,
        }),
      )
      if (poster) form.append('image', poster)
      if (video) form.append('video', video)

      const response = editing && ad ? await updateAds(ad._id, form) : await createAds(form)
      if (!response.ok) {
        toast(response.data?.message || 'The campaign could not be saved.', {type: 'error'})
        return
      }
      toast(response.data?.message || (editing ? 'Campaign updated' : 'Campaign created'), {
        type: 'success',
      })
      onSaved()
    } catch (error) {
      toast(error instanceof Error ? error.message : 'The campaign could not be saved.', {
        type: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#151922] shadow-2xl">
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-400">
            Mobile campaign
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            {editing ? `Edit ${ad?.title}` : 'Create an ad'}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            General controls the campaign. Mobile controls its welcome video and shared banner.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5">
          Cancel
        </button>
      </div>

      <div className="border-b border-white/10 px-5 pt-5 sm:px-7">
        <div className="inline-flex rounded-xl border border-white/10 bg-black/20 p-1">
          {(['general', 'mobile'] as Step[]).map(item => (
            <button
              key={item}
              type="button"
              onClick={() => {
                if (item === 'mobile' && !validateGeneral()) return
                setStep(item)
              }}
              className={`rounded-lg px-6 py-2.5 text-sm font-semibold capitalize transition ${
                step === item ? 'bg-red text-white' : 'text-slate-400 hover:text-white'
              }`}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-7">
        {step === 'general' ? (
          <>
            <div className="grid gap-5 lg:grid-cols-2">
              <Field label="Campaign title" required>
                <input
                  value={title}
                  onChange={event => setTitle(event.target.value)}
                  className="ad-input"
                  placeholder="e.g. Weekend premiere"
                />
              </Field>
              <Field label="Brand" required>
                <input
                  value={brand}
                  onChange={event => setBrand(event.target.value)}
                  className="ad-input"
                  placeholder="Advertiser or campaign owner"
                />
              </Field>
              <Field label="CTA link" required hint="Used by every banner location.">
                <input
                  type="url"
                  value={link}
                  onChange={event => setLink(event.target.value)}
                  className="ad-input"
                  placeholder="https://example.com/offer"
                />
              </Field>
              <Field label="Button label" required>
                <input
                  value={cta}
                  onChange={event => setCta(event.target.value)}
                  className="ad-input"
                  placeholder="Learn More"
                />
              </Field>
              <Field label="Starts" required>
                <input
                  type="datetime-local"
                  value={start}
                  onChange={event => setStart(event.target.value)}
                  className="ad-input [color-scheme:dark]"
                />
              </Field>
              <Field label="Expires" required hint="Expired campaigns are archived with analytics retained.">
                <input
                  type="datetime-local"
                  min={start}
                  value={expiry}
                  onChange={event => setExpiry(event.target.value)}
                  className="ad-input [color-scheme:dark]"
                />
              </Field>
              <Field label="Advertiser report emails" required={reportDelivery !== 'none'} hint="Separate multiple addresses with commas.">
                <input
                  type="text"
                  value={advertiserEmails}
                  onChange={event => setAdvertiserEmails(event.target.value)}
                  className="ad-input"
                  placeholder="advertiser@example.com"
                />
              </Field>
              <Field label="Report delivery" hint="Choose one delivery format.">
                <select value={reportDelivery} onChange={event => setReportDelivery(event.target.value as IAdsData['reportDelivery'])} className="ad-input">
                  <option value="none">Off</option>
                  <option value="live_link">Secure live analytics link</option>
                  <option value="csv">CSV attachment</option>
                </select>
              </Field>
              {reportDelivery !== 'none' ? <>
                <Field label="Delivery frequency" required>
                  <select value={reportFrequency} onChange={event => setReportFrequency(event.target.value as IAdsData['reportFrequency'])} className="ad-input">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </Field>
                <Field label="Report timezone" required hint="Used for report timestamps.">
                  <select value={reportTimezone} onChange={event => setReportTimezone(event.target.value)} className="ad-input">
                    <option value="Africa/Lagos">Africa/Lagos</option>
                    <option value="UTC">UTC</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </Field>
              </> : null}
            </div>
            <label className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <span>
                <span className="block text-sm font-medium text-white">Campaign active</span>
                <span className="block text-xs text-slate-400">
                  Inactive campaigns stay saved but are not shown in the app.
                </span>
              </span>
              <input
                type="checkbox"
                checked={active}
                onChange={event => setActive(event.target.checked)}
                className="h-5 w-5 accent-red"
              />
            </label>
          </>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Field
              label="Vertical welcome video"
              required={!editing || ad?.type === 'home_ad'}
              hint={editing && ad?.type !== 'home_ad' ? 'Leave empty to retain the current video.' : undefined}>
              <input
                type="file"
                accept="video/*"
                onChange={event => setVideo(event.target.files?.[0] ?? null)}
                className="ad-file"
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Recommended 1080 × 1920 (9:16). Plays on the authentication welcome screen.
              </p>
              {video ? (
                <p className="mt-3 truncate text-xs text-emerald-400">Selected: {video.name}</p>
              ) : null}
            </Field>

            <Field
              label="Horizontal mobile poster"
              required={!editing}
              hint={editing ? 'Leave empty to retain the current poster.' : undefined}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={event => choosePoster(event.target.files?.[0])}
                className="ad-file"
              />
              <PosterUploadGuide orientation="landscape" />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Reused in Home Premium Ads, Search, Downloads, Suggestions, and horizontal banners.
              </p>
              {preview ? (
                <SafeImage
                  src={preview}
                  fallbackSrc="/adsManager/landscape_web.png"
                  alt="Campaign poster preview"
                  width={960}
                  height={540}
                  className="mt-4 aspect-video w-full rounded-xl object-cover"
                />
              ) : null}
            </Field>
          </div>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={step === 'mobile' ? () => setStep('general') : onCancel}
            className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-slate-300">
            {step === 'mobile' ? 'Back to General' : 'Cancel'}
          </button>
          <button
            disabled={(step === 'general' ? !generalValid : !valid) || saving}
            className="rounded-xl bg-red px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-red/20 disabled:cursor-not-allowed disabled:opacity-40">
            {saving ? 'Saving…' : step === 'general' ? 'Continue to Mobile' : editing ? 'Save changes' : 'Create campaign'}
          </button>
        </div>
      </div>
    </form>
  )
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block text-sm text-slate-300">
      <span className="font-medium text-white">
        {label}
        {required ? <span className="ml-1 text-red-400">*</span> : null}
      </span>
      {hint ? <span className="ml-2 text-xs text-slate-500">{hint}</span> : null}
      <span className="mt-2 block">{children}</span>
    </label>
  )
}
