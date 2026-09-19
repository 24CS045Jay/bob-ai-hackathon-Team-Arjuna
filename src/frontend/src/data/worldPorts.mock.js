export const WORLD_PORTS = [
  {
    id: 'port-arjuna',
    name: 'Port of Arjuna',
    code: 'INARJ',
    country: 'India',
    region: 'South Asia',
    type: 'mega',
    lat: 21.68,
    lng: 72.52,
    importDwell: 3.2,
    exportDwell: 2.8,
    berthingDwell: 0.9,
    anchorDwell: 1.1,
    medianDwell: 3.0,
    vesselCount: 28
  },
  {
    id: 'port-jebel-ali',
    name: 'Jebel Ali Port',
    code: 'AEJEA',
    country: 'United Arab Emirates',
    region: 'Middle East',
    type: 'mega',
    lat: 25.01,
    lng: 55.06,
    importDwell: 2.3,
    exportDwell: 2.1,
    berthingDwell: 0.6,
    anchorDwell: 0.8,
    medianDwell: 2.2,
    vesselCount: 54
  },
  {
    id: 'port-singapore',
    name: 'Port of Singapore',
    code: 'SGSIN',
    country: 'Singapore',
    region: 'Southeast Asia',
    type: 'mega',
    lat: 1.26,
    lng: 103.82,
    importDwell: 2.0,
    exportDwell: 1.8,
    berthingDwell: 0.5,
    anchorDwell: 0.7,
    medianDwell: 1.9,
    vesselCount: 112
  },
  {
    id: 'port-shanghai',
    name: 'Port of Shanghai',
    code: 'CNSHA',
    country: 'China',
    region: 'East Asia',
    type: 'mega',
    lat: 31.23,
    lng: 121.47,
    importDwell: 4.2,
    exportDwell: 3.8,
    berthingDwell: 1.2,
    anchorDwell: 1.9,
    medianDwell: 4.0,
    vesselCount: 145
  },
  {
    id: 'port-rotterdam',
    name: 'Port of Rotterdam',
    code: 'NLRTM',
    country: 'Netherlands',
    region: 'Europe',
    type: 'mega',
    lat: 51.95,
    lng: 4.13,
    importDwell: 3.6,
    exportDwell: 3.1,
    berthingDwell: 0.8,
    anchorDwell: 1.0,
    medianDwell: 3.4,
    vesselCount: 68
  },
  {
    id: 'port-los-angeles',
    name: 'Port of Los Angeles',
    code: 'USLAX',
    country: 'United States',
    region: 'North America',
    type: 'large',
    lat: 33.74,
    lng: -118.27,
    importDwell: 6.4,
    exportDwell: 5.2,
    berthingDwell: 1.8,
    anchorDwell: 2.6,
    medianDwell: 6.1,
    vesselCount: 46
  },
  {
    id: 'port-nhava-sheva',
    name: 'Jawaharlal Nehru Port (JNPA)',
    code: 'INNSA',
    country: 'India',
    region: 'South Asia',
    type: 'large',
    lat: 18.95,
    lng: 72.95,
    importDwell: 3.7,
    exportDwell: 3.4,
    berthingDwell: 1.1,
    anchorDwell: 1.4,
    medianDwell: 3.5,
    vesselCount: 38
  },
  {
    id: 'port-colombo',
    name: 'Port of Colombo',
    code: 'LKCMB',
    country: 'Sri Lanka',
    region: 'South Asia',
    type: 'large',
    lat: 6.94,
    lng: 79.85,
    importDwell: 2.8,
    exportDwell: 2.4,
    berthingDwell: 0.7,
    anchorDwell: 0.9,
    medianDwell: 2.6,
    vesselCount: 42
  }
]

export const ACTIVE_VESSELS = [
  {
    id: 'vsl-101',
    name: 'MSC Arjuna',
    imo: 'IMO9839438',
    line: 'MSC Lines',
    status: 'berthed',
    lat: 21.68,
    lng: 72.52,
    heading: 42,
    speedKts: 0.0,
    teu: 24000,
    port: 'Port of Arjuna (INARJ)',
    eta: 'Berthed & Working'
  },
  {
    id: 'vsl-102',
    name: 'Maersk Baroda',
    imo: 'IMO9725110',
    line: 'Maersk Line',
    status: 'berthed',
    lat: 21.72,
    lng: 72.56,
    heading: 90,
    speedKts: 0.0,
    teu: 15500,
    port: 'Port of Arjuna (INARJ)',
    eta: 'Berthed & Working'
  },
  {
    id: 'vsl-103',
    name: 'CMA CGM Gujarat',
    imo: 'IMO9694529',
    line: 'CMA CGM Group',
    status: 'anchored',
    lat: 21.66,
    lng: 72.49,
    heading: 180,
    speedKts: 0.1,
    teu: 11800,
    port: 'Port of Arjuna (INARJ)',
    eta: '15 Sep 04:30'
  },
  {
    id: 'vsl-104',
    name: 'Evergreen Narmada',
    imo: 'IMO9352123',
    line: 'Evergreen Marine',
    status: 'transit',
    lat: 16.4,
    lng: 68.2,
    heading: 32,
    speedKts: 16.4,
    teu: 8500,
    port: 'Port of Arjuna (INARJ)',
    eta: '15 Sep 08:15'
  },
  {
    id: 'vsl-105',
    name: 'COSCO Tapi',
    imo: 'IMO9283411',
    line: 'COSCO Shipping',
    status: 'transit',
    lat: 12.1,
    lng: 65.5,
    heading: 25,
    speedKts: 18.2,
    teu: 7200,
    port: 'Port of Arjuna (INARJ)',
    eta: '15 Sep 14:00'
  },
  {
    id: 'vsl-106',
    name: 'ONE Kathiawar',
    imo: 'IMO9198734',
    line: 'Ocean Network Express',
    status: 'berthed',
    lat: 21.71,
    lng: 72.58,
    heading: 45,
    speedKts: 0.0,
    teu: 1800,
    port: 'Port of Arjuna (INARJ)',
    eta: 'Berthed & Working'
  },
  {
    id: 'vsl-107',
    name: 'Pacific Titan',
    imo: 'IMO9448102',
    line: 'Pacific International Lines',
    status: 'transit',
    lat: 7.2,
    lng: 78.4,
    heading: 315,
    speedKts: 15.6,
    teu: 9200,
    port: 'Jebel Ali (AEJEA)',
    eta: '16 Sep 19:00'
  },
  {
    id: 'vsl-108',
    name: 'Atlantic Pioneer',
    imo: 'IMO9319082',
    line: 'Hapag-Lloyd',
    status: 'transit',
    lat: 24.2,
    lng: 59.8,
    heading: 110,
    speedKts: 17.1,
    teu: 14000,
    port: 'Port of Singapore (SGSIN)',
    eta: '18 Sep 22:00'
  }
]

export const SHIPPING_LANES = [
  {
    name: 'Gulf of Khambhat Express Corridor',
    color: '#0085db',
    dashArray: '6, 8',
    coordinates: [
      [21.68, 72.52],
      [20.5, 71.8],
      [18.9, 70.5],
      [15.2, 67.8],
      [12.0, 64.0]
    ]
  },
  {
    name: 'Arabian Sea - Strait of Hormuz Trunk',
    color: '#10b981',
    dashArray: '5, 7',
    coordinates: [
      [21.68, 72.52],
      [22.5, 68.0],
      [24.5, 61.5],
      [25.01, 55.06]
    ]
  },
  {
    name: 'India - Malacca - Far East Super Highway',
    color: '#f59e0b',
    dashArray: '6, 6',
    coordinates: [
      [21.68, 72.52],
      [18.95, 72.95],
      [10.0, 75.0],
      [5.8, 80.2],
      [5.5, 95.0],
      [1.26, 103.82]
    ]
  },
  {
    name: 'Suez - Bab-el-Mandeb - Colombo Arterial',
    color: '#8b5cf6',
    dashArray: '6, 8',
    coordinates: [
      [27.8, 34.2],
      [20.0, 39.0],
      [12.5, 43.5],
      [10.0, 60.0],
      [6.94, 79.85]
    ]
  }
]
