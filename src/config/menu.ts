import type { MenuItem } from '@/types/menu'

export const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'HomeFilled',
    path: '/dashboard'
  },
  {
    title: 'Parking',
    icon: 'Location',
    path: '/parking'
  },
  {
    title: 'Reservations',
    icon: 'Calendar',
    path: '/reservation'
  },
  {
    title: 'Valet Service',
    icon: 'Service',
    path: '/valet'
  },
  {
    title: 'Dispatch',
    icon: 'Van',
    path: '/dispatch'
  },
  {
    title: 'Staff',
    icon: 'User',
    path: '/staff'
  },
  {
    title: 'Devices',
    icon: 'Monitor',
    path: '/device'
  },
  {
    title: 'Drivers',
    icon: 'User',
    path: '/driver'
  }
] 