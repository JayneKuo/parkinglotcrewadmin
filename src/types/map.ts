export interface LatLng {
  lat: number
  lng: number
}

export interface MapConfig {
  center: LatLng
  zoom: number
  mapTypeId?: string
}

export interface MapMarker {
  id: string
  position: LatLng
  title: string
  icon?: string
}