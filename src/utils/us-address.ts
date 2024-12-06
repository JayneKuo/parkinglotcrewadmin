import type { City, State } from '@/types/parking'

// 美国州数据
export const states: State[] = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
]

// 城市数据（按州分组）
export const cities: Record<string, City[]> = {
  'CA': [
    { value: 'LA', label: 'Los Angeles', zipCodes: ['90001', '90002', '90003', '90004', '90005'] },
    { value: 'SF', label: 'San Francisco', zipCodes: ['94102', '94103', '94104', '94105'] },
    { value: 'SD', label: 'San Diego', zipCodes: ['92101', '92102', '92103', '92104'] },
    { value: 'SJ', label: 'San Jose', zipCodes: ['95110', '95111', '95112', '95113'] }
  ],
  'NY': [
    { value: 'NYC', label: 'New York City', zipCodes: ['10001', '10002', '10003', '10004'] },
    { value: 'BUF', label: 'Buffalo', zipCodes: ['14201', '14202', '14203', '14204'] },
    { value: 'ROC', label: 'Rochester', zipCodes: ['14601', '14602', '14603', '14604'] }
  ],
  'TX': [
    { value: 'HOU', label: 'Houston', zipCodes: ['77001', '77002', '77003', '77004'] },
    { value: 'DAL', label: 'Dallas', zipCodes: ['75201', '75202', '75203', '75204'] },
    { value: 'AUS', label: 'Austin', zipCodes: ['78701', '78702', '78703', '78704'] }
  ],
  'FL': [
    { value: 'MIA', label: 'Miami', zipCodes: ['33101', '33102', '33103', '33104'] },
    { value: 'ORL', label: 'Orlando', zipCodes: ['32801', '32802', '32803', '32804'] },
    { value: 'TPA', label: 'Tampa', zipCodes: ['33601', '33602', '33603', '33604'] }
  ],
  'IL': [
    { value: 'CHI', label: 'Chicago', zipCodes: ['60601', '60602', '60603', '60604'] },
    { value: 'SPR', label: 'Springfield', zipCodes: ['62701', '62702', '62703', '62704'] },
    { value: 'ROK', label: 'Rockford', zipCodes: ['61101', '61102', '61103', '61104'] }
  ]
}

// 为其他州添加默认城市数据
states.forEach(state => {
  if (!cities[state.value]) {
    cities[state.value] = [
      {
        value: `${state.value}-CAP`,
        label: `${state.label} Capital`,
        zipCodes: [`${state.value}001`, `${state.value}002`, `${state.value}003`]
      }
    ]
  }
})

// 搜索州
export const searchStates = (query: string) => {
  if (!query) return states
  const lowerQuery = query.toLowerCase()
  return states.filter(state => 
    state.label.toLowerCase().includes(lowerQuery) || 
    state.value.toLowerCase().includes(lowerQuery)
  )
}

// 搜索城市
export const searchCities = (stateValue: string, query: string) => {
  const cityList = cities[stateValue] || []
  if (!query) return cityList
  const lowerQuery = query.toLowerCase()
  return cityList.filter(city => 
    city.label.toLowerCase().includes(lowerQuery) || 
    city.value.toLowerCase().includes(lowerQuery)
  )
}

// 获取邮编
export const getZipCodes = (stateValue: string, cityValue: string): string[] => {
  const cityList = cities[stateValue] || []
  const city = cityList.find(c => c.value === cityValue)
  return city?.zipCodes || []
}