import {IGeneric} from './auth.types'
import {IUpcomingData} from './upcoming.types'

export interface ITopTenContent extends IUpcomingData {
  topTenRank: number
}

export interface ITopTenResponse extends IGeneric {
  data: ITopTenContent[]
}
