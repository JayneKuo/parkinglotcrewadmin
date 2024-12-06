// 设备类型枚举
export enum DeviceType {
  RFID = 'rfid',
  Gate = 'gate',
  Camera = 'camera',
  LiDAR = 'lidar',
  LED = 'led'
}

// 设备状态枚举
export enum DeviceStatus {
  Active = 'active',
  Inactive = 'inactive',
  UnderMaintenance = 'maintenance'
}

// 电源类型
export type PowerSupply = 'AC' | 'Solar' | 'Battery'

// 设备基础接口
export interface Device {
  // 基本信息
  id: string                  // 设备编号 DEV-2024001
  name: string               // 设备名称 Main Entrance RFID Reader
  type: DeviceType          // 设备类型
  location: string          // 安装位置 Entrance A
  status: DeviceStatus      // 设备状态
  brand: string             // 设备品牌 Hikvision, Bosch
  model: string             // 设备型号 RFID-Pro-9000
  installationDate: string  // 安装日期 2024-03-01
  maintenanceCycle: number  // 维护周期(月)
  
  // 网络配置
  network: {
    ipAddress: string       // IP地址 192.168.1.101
    macAddress: string      // MAC地址 00:14:22:01:23:45
    port: number           // 端口号 8080
  }

  // 其他设置
  powerSupply: PowerSupply  // 电源类型
  errorLogging: boolean     // 错误日志支持
  notes?: string           // 备注

  // 设备特定配置
  config: DeviceConfig
}

// 设备特定配置接口
export interface DeviceConfig {
  name: string
  enabled: boolean
}

// RFID配置
export interface RFIDConfig extends DeviceConfig {
  frequency: '125KHz' | '13.56MHz' | '900MHz' | '2.4GHz'
  readRange: number // 读取范围(米)
  rfidProtocol: ('EPCGen2' | 'ISO18000-6C' | 'ISO14443' | 'ISO15693')[]
  tagCapacity: number // 标签容量
  antiCollision: boolean // 防冲突
  triggerMode: 'auto' | 'manual' | 'external' // 触发模式
  readTimeout: number // 读取超时(毫秒)
  powerLevel: number // 功率等级(dBm)
}

// 摄像头配置
export interface CameraConfig extends DeviceConfig {
  resolution: '720p' | '1080p' | '2K' | '4K'
  frameRate: number // 帧率
  features: {
    nightVision: boolean // 夜视
    autoFocus: boolean // 自动对焦
    faceDetection: boolean // 人脸检测
    lprEnabled: boolean // 车牌识别
  }
  streamProtocol: ('RTSP' | 'HTTP' | 'ONVIF')[] // 流媒体协议
  storage: {
    type: 'local' | 'cloud' | 'hybrid' // 存储类型
    retentionDays: number // 保留天数
  }
  outputFormat: {
    image: ('JPEG' | 'PNG')[]
    video: ('MP4' | 'H264' | 'H265')[]
  }
}

// 门禁配置
export interface GateConfig extends DeviceConfig {
  operationMode: 'automatic' | 'manual' | 'remote' // 操作模式
  openDuration: number // 开门持续时间(秒)
  closeDelay: number // 关门延迟(秒)
  speedControl: {
    opening: number // 开门速度(秒)
    closing: number // 关门速度(秒)
  }
  sensors: {
    vehicle: boolean // 车辆检测
    obstacle: boolean // 障碍物检测
    safety: boolean // 安全防夹
  }
  heightLimit: number // 限高(米)
  emergencyMode: 'open' | 'close' | 'maintain' // 紧急模式
  powerFailure: {
    action: 'open' | 'close' | 'maintain' // 断电动作
    batteryBackup: boolean // 电池备份
  }
}

// LiDAR配置
export interface LiDARConfig extends DeviceConfig {
  scanRange: {
    horizontal: number // 水平扫描范围(度)
    vertical: number // 垂直扫描范围(度)
  }
  resolution: {
    angular: number // 角分辨率(度)
    distance: number // 距离分辨率(毫米)
  }
  pointCloud: {
    format: 'PCD' | 'XYZ' | 'PLY' // 点云格式
    density: number // 点云密度(点/度²)
  }
  accuracy: number // 精度(毫米)
  frequency: number // 扫描频率(Hz)
  scanMode: {
    type: '2D' | '3D' // 扫描类型
    pattern: 'full' | 'partial' // 扫描模式
    coverage: number // 覆盖角度(度)
  }
  filters: {
    noise: boolean // 噪声过滤
    ground: boolean // 地面过滤
    clustering: boolean // 聚类过滤
  }
}

// 显示样式接口
export interface DisplayStyle {
  fontSize: number
  fontColor: string
  backgroundColor: string
  scrolling: boolean
  scrollSpeed: number
}

// LED显示屏配置
export interface LEDConfig extends DeviceConfig {
  // 硬件参数
  hardware: {
    resolution: {
      width: number // 宽度(像素)
      height: number // 高度(像素)
    }
    brightness: {
      current: number // 当前亮度(nits)
      auto: boolean // 自动调节
      sensor: boolean // 光感器
    }
    display: {
      refreshRate: number // 刷新率(Hz)
      colorDepth: 8 | 16 | 24 | 32 // 色彩深度(bit)
      pixelPitch: number // 像素间距(mm)
    }
  }

  // 显示内容配置
  display: {
    content: {
      // 停车场信息
      parking: {
        enabled: boolean
        position: { x: number, y: number, width: number, height: number }
        style: DisplayStyle
        content: {
          total: number
          available: number
          reserved: number
          updateInterval: number
        }
      }

      // 欢迎语
      welcome: {
        enabled: boolean
        position: { x: number, y: number, width: number, height: number }
        style: DisplayStyle
        content: {
          default: string // 默认欢迎语
          special: Array<{
            time: { start: string, end: string }
            text: string
          }>
        }
      }

      // 收费信息
      pricing: {
        enabled: boolean
        position: { x: number, y: number, width: number, height: number }
        style: DisplayStyle
        content: {
          hourly: number
          daily: number
          monthly: number
        }
      }

      // 日期时间
      datetime: {
        enabled: boolean
        position: { x: number, y: number, width: number, height: number }
        style: DisplayStyle
        format: string
      }

      // 天气信息
      weather: {
        enabled: boolean
        position: { x: number, y: number, width: number, height: number }
        style: DisplayStyle
        updateInterval: number
      }
    }
  }

  // 通信配置
  communication: {
    interface: ('RS232' | 'RS485' | 'Ethernet' | 'WiFi')[] // 通信接口
    protocol: string // 通信协议
  }
}

// 设备选项配置
export const deviceOptions = {
  types: [
    { label: 'RFID Reader', value: DeviceType.RFID },
    { label: 'Gate', value: DeviceType.Gate },
    { label: 'Camera', value: DeviceType.Camera },
    { label: 'LiDAR', value: DeviceType.LiDAR },
    { label: 'LED Display', value: DeviceType.LED }
  ],
  status: [
    { label: 'Active', value: DeviceStatus.Active },
    { label: 'Inactive', value: DeviceStatus.Inactive },
    { label: 'Under Maintenance', value: DeviceStatus.UnderMaintenance }
  ],
  powerSupply: [
    { label: 'AC Power', value: 'AC' },
    { label: 'Solar Power', value: 'Solar' },
    { label: 'Battery', value: 'Battery' }
  ]
}

// 表单验证规则
export const deviceRules = {
  name: [
    { required: true, message: 'Please enter device name', trigger: 'blur' },
    { min: 3, max: 50, message: 'Length should be 3 to 50 characters', trigger: 'blur' }
  ],
  type: [
    { required: true, message: 'Please select device type', trigger: 'change' }
  ],
  location: [
    { required: true, message: 'Please enter installation location', trigger: 'blur' }
  ],
  brand: [
    { required: true, message: 'Please enter device brand', trigger: 'blur' }
  ],
  model: [
    { required: true, message: 'Please enter device model', trigger: 'blur' }
  ],
  installationDate: [
    { required: true, message: 'Please select installation date', trigger: 'change' }
  ],
  maintenanceCycle: [
    { required: true, message: 'Please enter maintenance cycle', trigger: 'blur' },
    { type: 'number', min: 1, max: 24, message: 'Value should be between 1 and 24 months', trigger: 'blur' }
  ],
  'network.ipAddress': [
    { required: true, message: 'Please enter IP address', trigger: 'blur' },
    { pattern: /^(\d{1,3}\.){3}\d{1,3}$/, message: 'Please enter valid IP address', trigger: 'blur' }
  ],
  'network.macAddress': [
    { required: true, message: 'Please enter MAC address', trigger: 'blur' },
    { pattern: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, message: 'Please enter valid MAC address', trigger: 'blur' }
  ],
  'network.port': [
    { required: true, message: 'Please enter port number', trigger: 'blur' },
    { type: 'number', min: 1, max: 65535, message: 'Port should be between 1 and 65535', trigger: 'blur' }
  ]
}

// 设备配置项类型
export interface DeviceConfigItem {
  key: string
  label: string
  type: 'input' | 'select' | 'switch' | 'number'
  defaultValue: string | number | boolean
  options?: { label: string; value: string }[]
  description?: string
}

// 设备类型配置
export const deviceTypeConfig: Record<DeviceType, {
  label: string
  icon: string
  configItems: DeviceConfigItem[]
}> = {
  [DeviceType.RFID]: {
    label: 'RFID Reader',
    icon: 'Connection',
    configItems: [
      {
        key: 'frequency',
        label: 'Operating Frequency',
        type: 'select',
        defaultValue: '900MHz',
        options: [
          { label: '900 MHz', value: '900MHz' },
          { label: '2.4 GHz', value: '2.4GHz' }
        ],
        description: 'Working frequency of the RFID reader'
      },
      {
        key: 'antennaCount',
        label: 'Number of Antennas',
        type: 'number',
        defaultValue: 2,
        description: 'Number of antennas connected'
      }
    ]
  },
  [DeviceType.Gate]: {
    label: 'Gate',
    icon: 'Van',
    configItems: [
      {
        key: 'operationMode',
        label: 'Operation Mode',
        type: 'select',
        defaultValue: 'automatic',
        options: [
          { label: 'Automatic', value: 'automatic' },
          { label: 'Manual', value: 'manual' }
        ]
      },
      {
        key: 'obstacleDetection',
        label: 'Obstacle Detection',
        type: 'switch',
        defaultValue: true
      }
    ]
  },
  [DeviceType.Camera]: {
    label: 'Camera',
    icon: 'VideoCamera',
    configItems: [
      {
        key: 'resolution',
        label: 'Resolution',
        type: 'select',
        defaultValue: '1080p',
        options: [
          { label: '720p', value: '720p' },
          { label: '1080p', value: '1080p' },
          { label: '4K', value: '4k' }
        ]
      },
      {
        key: 'nightVision',
        label: 'Night Vision',
        type: 'switch',
        defaultValue: true
      }
    ]
  },
  [DeviceType.LiDAR]: {
    label: 'LiDAR',
    icon: 'Aim',
    configItems: [
      {
        key: 'scanFrequency',
        label: 'Scan Frequency',
        type: 'number',
        defaultValue: 50,
        description: 'Scanning frequency in Hz'
      },
      {
        key: 'detectionRange',
        label: 'Detection Range',
        type: 'number',
        defaultValue: 30,
        description: 'Maximum detection range in meters'
      }
    ]
  },
  [DeviceType.LED]: {
    label: 'LED Display',
    icon: 'Monitor',
    configItems: [
      {
        key: 'brightness',
        label: 'Brightness Control',
        type: 'select',
        defaultValue: 'auto',
        options: [
          { label: 'Automatic', value: 'auto' },
          { label: 'Manual', value: 'manual' }
        ]
      },
      {
        key: 'refreshRate',
        label: 'Refresh Rate',
        type: 'number',
        defaultValue: 60,
        description: 'Display refresh rate in Hz'
      }
    ]
  }
}

// 模拟数据
export const mockDevices: Device[] = [
  {
    id: 'DEV001',
    name: 'Main Entrance RFID',
    type: DeviceType.RFID,
    location: 'Main Entrance',
    status: DeviceStatus.Active,
    brand: 'Zebra',
    model: 'RFID-Pro-9000',
    installationDate: '2024-01-01',
    maintenanceCycle: 6,
    network: {
      ipAddress: '192.168.1.101',
      macAddress: '00:14:22:01:23:45',
      port: 8080
    },
    powerSupply: 'AC',
    errorLogging: true,
    config: {
      name: 'Main Entrance RFID',
      enabled: true,
      frequency: '900MHz',
      readRange: 100,
      antiCollision: true,
      rfidProtocol: ['EPCGen2'],
      tagCapacity: 100,
      triggerMode: 'auto',
      readTimeout: 1000,
      powerLevel: 20
    } as RFIDConfig
  },
  {
    id: 'DEV002',
    name: 'Exit Gate Control',
    type: DeviceType.Gate,
    location: 'Exit Area',
    status: DeviceStatus.Active,
    brand: 'Bosch',
    model: 'Gate-X100',
    installationDate: '2024-01-01',
    maintenanceCycle: 3,
    network: {
      ipAddress: '192.168.1.102',
      macAddress: '00:14:22:01:23:46',
      port: 8081
    },
    powerSupply: 'AC',
    errorLogging: true,
    config: {
      name: 'Exit Gate Control',
      enabled: true,
      operationMode: 'automatic',
      openDuration: 10,
      closeDelay: 5,
      speedControl: {
        opening: 3,
        closing: 3
      },
      sensors: {
        vehicle: true,
        obstacle: true,
        safety: true
      },
      heightLimit: 2.5,
      emergencyMode: 'maintain',
      powerFailure: {
        action: 'maintain',
        batteryBackup: true
      }
    } as GateConfig
  }
] 