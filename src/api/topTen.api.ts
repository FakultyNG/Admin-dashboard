import {IContentSearchResponse} from '@/types/api/upcoming.types'
import {ITopTenResponse} from '@/types/api/topTen.types'
import {apiCall} from './auth.api'

export const fetchTopTen = async () =>
  apiCall<ITopTenResponse>(api => api.get('/superadmin/top-10'))

export const saveTopTen = async (videoIds: string[]) =>
  apiCall<ITopTenResponse>(api => api.put('/superadmin/top-10', {videoIds}))

export const autoRankTopTen = async () =>
  apiCall<ITopTenResponse>(api => api.post('/superadmin/top-10/auto-rank'))

export const searchTopTenCandidates = async (text: string) =>
  apiCall<IContentSearchResponse>(api =>
    api.get(`/superadmin/shared/featured/contents/search/${encodeURIComponent(text)}`),
  )
