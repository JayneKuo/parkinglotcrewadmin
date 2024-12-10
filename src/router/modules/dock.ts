import { RouteRecordRaw } from 'vue-router'

const dockRoutes: RouteRecordRaw = {
  path: '/dock',
  name: 'Dock',
  component: () => import('@/layouts/default.vue'),
  meta: {
    title: 'Dock Management',
    icon: 'Box',
    order: 41
  },
  children: [
    {
      path: '',
      name: 'DockList',
      component: () => import('@/views/dock/index.vue'),
      meta: {
        title: 'Dock List'
      }
    },
    {
      path: ':id',
      name: 'DockDetail',
      component: () => import('@/views/dock/detail.vue'),
      meta: {
        title: 'Appointment Details',
        hidden: true
      }
    }
  ]
}

export default dockRoutes 