<template>
  <div class="parking-map">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Loader } from '@googlemaps/js-api-loader'
import type { ParkingLot } from '@/types/parking'
import type { MapConfig } from '@/types/map'

const props = defineProps<{
  parkingLots: ParkingLot[]
}>()

const emit = defineEmits(['marker-click'])

const mapContainer = ref<HTMLElement>()
let map: google.maps.Map | null = null
let markers: google.maps.Marker[] = []

// 地图配置
const defaultConfig: MapConfig = {
  center: { lat: 39.8283, lng: -98.5795 }, // 美国中心点
  zoom: 4
}

// 初始化地图
const initMap = async () => {
  if (!mapContainer.value) return

  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    version: 'weekly'
  })

  try {
    const google = await loader.load()
    map = new google.maps.Map(mapContainer.value, defaultConfig)
    addMarkers()
  } catch (error) {
    console.error('Failed to load Google Maps:', error)
  }
}

// 添加标记点
const addMarkers = () => {
  if (!map) return
  
  // 清除现有标记
  markers.forEach(marker => marker.setMap(null))
  markers = []

  // 添加新标记
  props.parkingLots.forEach(parking => {
    const marker = new google.maps.Marker({
      position: parking.location,
      map,
      title: parking.name,
      icon: {
        url: getMarkerIcon(parking.status),
        scaledSize: new google.maps.Size(32, 32)
      }
    })

    // 添加点击事件
    marker.addListener('click', () => {
      emit('marker-click', parking)
    })

    markers.push(marker)
  })

  // 自动调整地图视野
  if (markers.length > 0) {
    const bounds = new google.maps.LatLngBounds()
    markers.forEach(marker => bounds.extend(marker.getPosition()!))
    map.fitBounds(bounds)
  }
}

// 获取标记图标
const getMarkerIcon = (status: string): string => {
  const icons: Record<string, string> = {
    active: '/markers/active.png',
    maintenance: '/markers/maintenance.png',
    full: '/markers/full.png',
    closed: '/markers/closed.png'
  }
  return icons[status] || icons.active
}

// 监听停车场数据变化
watch(() => props.parkingLots, () => {
  if (map) {
    addMarkers()
  }
}, { deep: true })

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  markers.forEach(marker => marker.setMap(null))
  markers = []
  map = null
})
</script>

<style scoped>
.parking-map {
  height: 100%;
  width: 100%;
}

.map-container {
  height: 100%;
  width: 100%;
}
</style>