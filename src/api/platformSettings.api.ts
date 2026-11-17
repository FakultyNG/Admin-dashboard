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
