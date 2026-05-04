export type Appointment = {
  firstName: string
  lastName: string
  email: string
  phone: string
  date: Date | null
  service: string
  vehicleMake?: string
  vehicleModel?: string
  vehicleYear?: string
  message?: string
  website_url?: string
}