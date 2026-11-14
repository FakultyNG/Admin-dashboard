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
