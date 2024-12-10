import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: "Login",
      hidden: true,
      public: true,
    },
  },
  {
    path: "/",
    component: () => import("@/layouts/default.vue"),
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        meta: {
          title: "Dashboard",
          icon: "DataBoard",
          order: 10,
        },
      },
      // Device 相关路由
      {
        path: "device",
        name: "Device",
        component: () => import("@/views/device/index.vue"),
        meta: {
          title: "Device List",
          icon: "Monitor",
          order: 20,
        },
      },
      {
        path: "device/rfid",
        name: "RFID",
        component: () => import("@/views/rfid/index.vue"),
        meta: {
          title: "RFID Management",
          icon: "Monitor",
          order: 20,
        },
      },
      {
        path: "device/monitor",
        name: "DeviceMonitor",
        component: () => import("@/views/device/monitor.vue"),
        meta: {
          title: "Device Monitor",
          hidden: true,
          order: 20,
        },
      },
      {
        path: "device/add",
        name: "AddDevice",
        component: () => import("@/views/device/DeviceForm.vue"),
        meta: {
          title: "Add Device",
          hidden: true,
          order: 20,
        },
      },
      {
        path: "device/edit/:id",
        name: "EditDevice",
        component: () => import("@/views/device/DeviceForm.vue"),
        meta: {
          title: "Edit Device",
          hidden: true,
          order: 20,
        },
      },
      // Parking 相关路由
      {
        path: "parking",
        name: "Parking",
        component: () => import("@/views/parking/index.vue"),
        meta: {
          title: "Parking Management",
          icon: "Location",
          order: 20,
        },
      },
      {
        path: "parking/add",
        name: "ParkingAdd",
        component: () => import("@/views/parking/add.vue"),
        meta: {
          title: "Add Parking",
          hidden: true,
          order: 20,
        },
      },
      // 其他现有路由保持不变...
      {
        path: "reservation",
        name: "Reservation",
        component: () => import("@/views/reservation/index.vue"),
        meta: {
          title: "Reservations",
          icon: "Calendar",
          order: 30,
        },
      },
      {
        path: "reservation/detail/:id",
        name: "ReservationDetail",
        component: () => import("@/views/reservation/detail.vue"),
        meta: {
          title: "Reservation Detail",
          hidden: true,
          order: 30,
        },
      },
      
      {
        path: "valet",
        name: "Valet",
        component: () => import("@/views/valet/index.vue"),
        meta: {
          title: "Valet Service",
          icon: "Van",
          order: 40,
        },
      },
      {
        path: "valet/detail/:id",
        name: "ValetDetail",
        component: () => import("@/views/valet/detail.vue"),
        meta: {
          title: "Valet Detail",
          hidden: true,
          order: 40,
        },
      },
      {
        path: "dock",
        name: "Dock",
        component: () => import("@/views/dock/index.vue"),
        meta: {
          title: "Dock Management",
          icon: "Box",
          order: 41,
        },
      },
      {
        path: "dock/:id",
        name: "DockDetail",
        component: () => import("@/views/dock/detail.vue"),
        meta: {
          title: "Appointment Details",
          hidden: true,
          order: 41,
        },
      },
      {
        path: "dispatch",
        name: "Dispatch",
        component: () => import("@/views/dispatch/index.vue"),
        meta: {
          title: "Dispatch",
          icon: "Guide",
          order: 50,
        },
      },
      {
        path: "staff",
        name: "Staff",
        component: () => import("@/views/staff/index.vue"),
        meta: {
          title: "Staff Management",
          icon: "User",
          order: 60,
        },
      },
      {
        path: "driver",
        name: "Drivers",
        component: () => import("@/views/driver/index.vue"),
        meta: {
          title: "Drivers",
          icon: "Avatar",
          order: 70,
        },
      },
      {
        path: "finance",
        name: "Finance",
        component: () => import("@/views/finance/index.vue"),
        meta: {
          title: "Finance",
          icon: "Money",
          order: 80,
        },
      },
      {
        path: "merchant",
        name: "Merchants",
        component: () => import("@/views/merchant/index.vue"),
        meta: {
          title: "Merchants",
          icon: "Shop",
          order: 100,
        },
      },
      {
        path: "plan",
        name: "Plans",
        component: () => import("@/views/plan/index.vue"),
        meta: {
          title: "Plans",
          icon: "List",
          order: 110,
        },
      },
      {
        path: "users",
        name: "Users",
        component: () => import("@/views/users/index.vue"),
        meta: {
          title: "Users",
          icon: "UserFilled",
          order: 120,
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫保持不变
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  if (to.path === "/login") {
    if (token) {
      next("/");
    } else {
      next();
    }
    return;
  }

  if (to.meta.public) {
    next();
    return;
  }

  if (!token) {
    next({
      path: "/login",
      query: { redirect: to.fullPath },
    });
    return;
  }

  next();
});

export default router;
