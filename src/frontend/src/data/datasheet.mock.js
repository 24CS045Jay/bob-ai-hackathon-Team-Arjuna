export const CARGO_TYPES = [
  'General Cargo',
  'Reefer Cargo',
  'Hazardous Materials',
  'Automotive',
  'Dry Bulk',
  'Liquid Petrochemical'
]

export const SHIP_TYPES = [
  'Container Ship',
  'Crude Oil Tanker',
  'Chemical Tanker',
  'Bulk Carrier',
  'Vehicles Carrier',
  'General Cargo'
]

export const FLAGS = [
  'India',
  'Panama',
  'Denmark',
  'France',
  'Singapore',
  'Taiwan',
  'Hong Kong',
  'Germany',
  'Japan',
  'Liberia'
]

export const SHIP_DATASHEETS = [
  {
    id: 'ship-1',
    shipName: 'MSC Arjuna',
    imo: 'IMO9839438',
    flag: 'Panama',
    type: 'Container Ship',
    grossTonnage: '232,618',
    teu: '24,000',
    lengthM: '399.9',
    beamM: '61.3',
    draftM: '15.5',
    yearBuilt: '2023',
    classification: 'DNV GL',
    owner: 'Mediterranean Shipping Company S.A.',
    operator: 'MSC Container Lines',
    status: 'active',
    lastPort: 'Jebel Ali (AEJEA)',
    nextPort: 'Singapore (SGSIN)',
    cargo: [
      {
        id: 'c-101',
        containerId: 'MSCU-982142-3',
        type: 'General Cargo',
        weightTons: '26.4',
        destination: 'Ahmedabad ICD',
        hazmat: false,
        reefer: false,
        status: 'loaded'
      },
      {
        id: 'c-102',
        containerId: 'MSCU-771239-0',
        type: 'Reefer Cargo',
        weightTons: '22.1',
        destination: 'Mumbai Cold Chain Hub',
        hazmat: false,
        reefer: true,
        status: 'loaded'
      },
      {
        id: 'c-103',
        containerId: 'MSCU-334109-8',
        type: 'Hazardous Materials',
        weightTons: '18.9',
        destination: 'Dahej Petro Complex',
        hazmat: true,
        reefer: false,
        status: 'in_transit'
      }
    ]
  },
  {
    id: 'ship-2',
    shipName: 'Maersk Baroda',
    imo: 'IMO9725110',
    flag: 'Denmark',
    type: 'Container Ship',
    grossTonnage: '165,000',
    teu: '15,500',
    lengthM: '366.4',
    beamM: '48.2',
    draftM: '14.5',
    yearBuilt: '2021',
    classification: 'Lloyd\'s Register',
    owner: 'A.P. Moller-Maersk Group',
    operator: 'Maersk Line',
    status: 'docked',
    lastPort: 'Singapore (SGSIN)',
    nextPort: 'Salalah (OMSLL)',
    cargo: [
      {
        id: 'c-201',
        containerId: 'MAEU-440192-8',
        type: 'General Cargo',
        weightTons: '24.8',
        destination: 'Delhi Tughlakabad ICD',
        hazmat: false,
        reefer: false,
        status: 'discharged'
      },
      {
        id: 'c-202',
        containerId: 'MAEU-889102-1',
        type: 'Reefer Cargo',
        weightTons: '21.0',
        destination: 'Surat Agro Terminal',
        hazmat: false,
        reefer: true,
        status: 'loaded'
      }
    ]
  },
  {
    id: 'ship-3',
    shipName: 'CMA CGM Gujarat',
    imo: 'IMO9694529',
    flag: 'France',
    type: 'Container Ship',
    grossTonnage: '120,000',
    teu: '11,800',
    lengthM: '335.0',
    beamM: '45.6',
    draftM: '14.0',
    yearBuilt: '2020',
    classification: 'Bureau Veritas',
    owner: 'CMA CGM S.A.',
    operator: 'CMA CGM Lines',
    status: 'queued',
    lastPort: 'Port Klang (MYPKG)',
    nextPort: 'Port of Arjuna (INARJ)',
    cargo: [
      {
        id: 'c-301',
        containerId: 'CMAU-781920-5',
        type: 'General Cargo',
        weightTons: '28.2',
        destination: 'Sanand Industrial Park',
        hazmat: false,
        reefer: false,
        status: 'in_transit'
      }
    ]
  },
  {
    id: 'ship-4',
    shipName: 'Bharat Pioneer',
    imo: 'IMO9621430',
    flag: 'India',
    type: 'Crude Oil Tanker',
    grossTonnage: '160,000',
    teu: '0',
    lengthM: '333.0',
    beamM: '60.0',
    draftM: '16.0',
    yearBuilt: '2019',
    classification: 'Indian Register of Shipping',
    owner: 'Shipping Corporation of India',
    operator: 'SCI Tankers',
    status: 'arriving',
    lastPort: 'Ras Tanura (SARST)',
    nextPort: 'Port of Arjuna SPM',
    cargo: [
      {
        id: 'c-401',
        containerId: 'TANK-99102-A',
        type: 'Liquid Petrochemical',
        weightTons: '280,000',
        destination: 'Vadinar Refinery Grid',
        hazmat: true,
        reefer: false,
        status: 'loaded'
      }
    ]
  }
]
