import { apiCall } from '@/api/auth.api'

type GuestAccessResponse = {
  status: number
  message: string
  data: { enabled: boolean }
}

export const getGuestAccessSetting = () =>
  apiCall<GuestAccessResponse>(api => api.get('/superadmin/platform-settings/guest-access'))

export const updateGuestAccessSetting = (enabled: boolean) =>
  apiCall<GuestAccessResponse>(api =>
    api.put('/superadmin/platform-settings/guest-access', { enabled }),
  )

export type LiveAccessSetting = {
  enabled: boolean
  updatedAt?: string
  updatedBy?: {
    id: string
    name: string
    email: string
  } | null
}

type LiveAccessResponse = {
  status: number
  message: string
  data: LiveAccessSetting
}

export const getLiveAccessSetting = () =>
  apiCall<LiveAccessResponse>(api =>
    api.get('/superadmin/platform-settings/live-access'),
  )

export const updateLiveAccessSetting = (enabled: boolean) =>
  apiCall<LiveAccessResponse>(api =>
    api.put('/superadmin/platform-settings/live-access', {enabled}),
  )

type GiftCardAuthorizationStatusResponse = {
  status: number
  message: string
  data: {configured: boolean}
}

export const getGiftCardAuthorizationStatus = () =>
  apiCall<GiftCardAuthorizationStatusResponse>(api =>
    api.get('/superadmin/giftcard/authorization-code'),
  )

export const changeGiftCardAuthorizationCode = (newCode: string) =>
  apiCall<{status: number; message: string}>(api =>
    api.put('/superadmin/giftcard/authorization-code', {newCode}),
  )
