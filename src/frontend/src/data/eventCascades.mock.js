export const EVENT_CASCADES = [
  {
    id: 'c1',
    category: 'Gate Ingress',
    estimatedCost: '$38,400',
    trigger: 'OCR Camera Failure at Gate 3',
    directImpact: 'Gate 3 Optical Scanner Malfunction & Lane Throttling',
    rippleSummary:
      'Optical OCR failure reduces Gate 3 ingress capacity by 50%, backing up commercial drayage trucks onto the port arterial expressway and delaying export container delivery to Berth 5.',
    nodes: [
      {
        id: 'n1',
        entity: 'Gate 3 Optical Scanner',
        delay: '+0 min',
        severity: 'crit',
        label: 'Hardware driver timeout drops OCR automated throughput from 120 to 55 trucks/hr.'
      },
      {
        id: 'n2',
        entity: 'Port Approach Arterial',
        delay: '+25 min',
        severity: 'crit',
        label: 'Commercial drayage queue exceeds 44 trucks, blocking emergency access lane.'
      },
      {
        id: 'n3',
        entity: 'Yard Block B Staging',
        delay: '+45 min',
        severity: 'warn',
        label: 'Terminal chassis trucks delayed returning empty flats; container pickup stall.'
      },
      {
        id: 'n4',
        entity: 'Quay Crane STS-04 (Berth 5)',
        delay: '+75 min',
        severity: 'warn',
        label: 'Quay crane idles waiting for export boxes; gross crane moves drop below 20 GMPH.'
      },
      {
        id: 'n5',
        entity: 'MV Coral Voyager Laytime',
        delay: '+110 min',
        severity: 'crit',
        label: 'Berth turnaround window exceeds 48-hour laytime threshold; demurrage fines accrue.'
      }
    ]
  },
  {
    id: 'c2',
    category: 'Quayside Crane',
    estimatedCost: '$72,000',
    trigger: 'STS Crane 2 Power Trip at Berth B02',
    directImpact: 'Super Post-Panamax Crane Electrical Fault at Berth B02',
    rippleSummary:
      'Sudden power bus trip halts 35 GMPH discharge cycle on 15,500 TEU vessel Maersk Baroda, cascading into yard stack saturation and outbound channel transit delay.',
    nodes: [
      {
        id: 'n1',
        entity: 'STS Crane C-02 Gantry',
        delay: '+0 min',
        severity: 'crit',
        label: 'Main 11kV busbar trip shuts down twin-lift spreader during tier 4 container cycle.'
      },
      {
        id: 'n2',
        entity: 'Berth B02 Gang Allocation',
        delay: '+30 min',
        severity: 'warn',
        label: 'Stevedore gang paused; single remaining crane C-01 unable to maintain vessel pace.'
      },
      {
        id: 'n3',
        entity: 'High-Tide Departure Window',
        delay: '+90 min',
        severity: 'crit',
        label: 'Departure delayed past 18:45 UTC high tide (+3.6m); vessel held for next cycle (+12h).'
      },
      {
        id: 'n4',
        entity: 'Inbound Anchorage Queue',
        delay: '+150 min',
        severity: 'warn',
        label: 'Next assigned vessel CMA CGM Gujarat forced into anchorage hold for additional 14h.'
      }
    ]
  }
]
