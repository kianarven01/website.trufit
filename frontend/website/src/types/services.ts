export interface Service {
  id: number
  title: string
  description: string
  icon: string      // must match lucide-react icon name exactly (case-sensitive)
  image: string     // path to image in /public
}