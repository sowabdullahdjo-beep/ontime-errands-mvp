export type JobType = 'SCHEDULED' | 'URGENT'
export type PickupType = 'PERSON' | 'BUSINESS'
export type JobStatus = 'OPEN' | 'ASSIGNED' | 'IN_PICKUP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED' | 'CANCELLED'

export interface User {
  id: string
  name: string
  email: string
  isRunner: boolean
  isAdmin: boolean
}

export interface Job {
  id: string
  type: JobType
  status: JobStatus
  pickupType: PickupType
  pickupName: string
  pickupAddress: string
  dropoffName: string
  dropoffAddress: string
  itemDescription: string
  scheduledPickupTime?: string
  urgentRequested: boolean
  totalFeeCents: number
  runnerPayoutCents: number
  customerPaid: boolean
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: User
}
