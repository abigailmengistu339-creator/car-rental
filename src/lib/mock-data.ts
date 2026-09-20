// ============================================
// Mock Data & LocalStorage Persistence Engine
// ============================================

import {
  type Profile,
  type Vehicle,
  type VehicleWithDriver,
  UserRole,
  ModelCategory,
  OperationalStatus,
} from './types';

// Helper to generate a realistic SVG document as Data URL
function createSampleDocumentUrl(title: string, plateNumber: string, docType: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
    <rect width="600" height="800" fill="#f8fafc" rx="16"/>
    <rect x="20" y="20" width="560" height="760" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" rx="12"/>
    <rect x="40" y="40" width="520" height="70" fill="#0f172a" rx="8"/>
    <text x="60" y="75" fill="#f59e0b" font-family="system-ui, sans-serif" font-size="16" font-weight="bold">RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE</text>
    <text x="60" y="95" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">MINISTÈRE DES TRANSPORTS — DIRECTION DES MINES</text>
    
    <text x="60" y="160" fill="#0f172a" font-family="system-ui, sans-serif" font-size="24" font-weight="bold">${title}</text>
    <text x="60" y="185" fill="#64748b" font-family="system-ui, sans-serif" font-size="13">Document ID: ${docType.toUpperCase()}-2026-${plateNumber.replace(/\D/g, '')}</text>
    
    <line x1="60" y1="205" x2="540" y2="205" stroke="#e2e8f0" stroke-width="1.5"/>
    
    <rect x="60" y="225" width="480" height="90" fill="#f1f5f9" rx="8" stroke="#cbd5e1"/>
    <text x="80" y="255" fill="#475569" font-family="system-ui, sans-serif" font-size="11" font-weight="600">IMMATRICULATION DU VÉHICULE</text>
    <text x="80" y="290" fill="#0f172a" font-family="monospace" font-size="28" font-weight="bold">${plateNumber}</text>
    
    <text x="60" y="360" fill="#334155" font-family="system-ui, sans-serif" font-size="14" font-weight="600">CERTIFICATION ET STATUT</text>
    <text x="60" y="390" fill="#059669" font-family="system-ui, sans-serif" font-size="16" font-weight="bold">✓ CONFORME ET ENREGISTRÉ AU REGISTRE CENTRAL</text>
    <text x="60" y="420" fill="#64748b" font-family="system-ui, sans-serif" font-size="13">Date d'émission: 15 Janvier 2026 · Validité: 31 Décembre 2026</text>
    <text x="60" y="445" fill="#64748b" font-family="system-ui, sans-serif" font-size="13">Assureur / Émetteur: Compagnie Nationale d'Assurance (SAA / CAAT)</text>
    
    <rect x="60" y="490" width="480" height="150" fill="#f8fafc" stroke="#e2e8f0" stroke-dasharray="6,6" rx="8"/>
    <text x="80" y="525" fill="#0f172a" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">CONDITIONS D'EXPLOITATION:</text>
    <text x="80" y="555" fill="#475569" font-family="system-ui, sans-serif" font-size="12">1. Le conducteur désigné doit détenir ce document dans le véhicule en tout temps.</text>
    <text x="80" y="580" fill="#475569" font-family="system-ui, sans-serif" font-size="12">2. Contrôle technique semestriel obligatoire conformément à la réglementation.</text>
    <text x="80" y="605" fill="#475569" font-family="system-ui, sans-serif" font-size="12">3. En cas de sinistre, contacter immédiatement la permanence flotte.</text>
    
    <!-- Official Stamp -->
    <circle cx="460" cy="700" r="45" fill="none" stroke="#0284c7" stroke-width="2" stroke-dasharray="4,2"/>
    <circle cx="460" cy="700" r="38" fill="none" stroke="#0284c7" stroke-width="1"/>
    <text x="460" y="695" text-anchor="middle" fill="#0284c7" font-family="system-ui, sans-serif" font-size="9" font-weight="bold">DIRECTION DES TRANSPORTS</text>
    <text x="460" y="708" text-anchor="middle" fill="#0284c7" font-family="system-ui, sans-serif" font-size="8" font-weight="bold">VISA VALIDÉ</text>
    <text x="460" y="720" text-anchor="middle" fill="#0284c7" font-family="system-ui, sans-serif" font-size="8">ALGER 2026</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

const INITIAL_PROFILES: Profile[] = [
  // Drivers
  { id: 'a1b2c3d4-0001-4000-8000-000000000001', full_name: 'Ahmed Benali', phone_number: '+213 555 0101', role: UserRole.Driver, created_at: '2024-01-15T10:00:00Z' },
  { id: 'a1b2c3d4-0002-4000-8000-000000000002', full_name: 'Karim Hadji', phone_number: '+213 555 0102', role: UserRole.Driver, created_at: '2024-01-16T10:00:00Z' },
  { id: 'a1b2c3d4-0003-4000-8000-000000000003', full_name: 'Youcef Mansouri', phone_number: '+213 555 0103', role: UserRole.Driver, created_at: '2024-01-17T10:00:00Z' },
  { id: 'a1b2c3d4-0004-4000-8000-000000000004', full_name: 'Omar Boudiaf', phone_number: '+213 555 0104', role: UserRole.Driver, created_at: '2024-02-01T10:00:00Z' },
  { id: 'a1b2c3d4-0005-4000-8000-000000000005', full_name: 'Rachid Amrani', phone_number: '+213 555 0105', role: UserRole.Driver, created_at: '2024-02-10T10:00:00Z' },
  { id: 'a1b2c3d4-0006-4000-8000-000000000006', full_name: 'Sofiane Khelifi', phone_number: '+213 555 0106', role: UserRole.Driver, created_at: '2024-03-01T10:00:00Z' },
  { id: 'a1b2c3d4-0007-4000-8000-000000000007', full_name: 'Nabil Cherif', phone_number: '+213 555 0107', role: UserRole.Driver, created_at: '2024-03-15T10:00:00Z' },
  { id: 'a1b2c3d4-0008-4000-8000-000000000008', full_name: 'Mourad Belkacem', phone_number: '+213 555 0108', role: UserRole.Driver, created_at: '2024-04-01T10:00:00Z' },
  // Clients
  { id: 'b1b2c3d4-0001-4000-8000-000000000001', full_name: 'Fatima Zahra', phone_number: '+213 555 0201', role: UserRole.Client, created_at: '2024-02-20T10:00:00Z' },
  { id: 'b1b2c3d4-0002-4000-8000-000000000002', full_name: 'Djamila Oussedik', phone_number: '+213 555 0202', role: UserRole.Client, created_at: '2024-03-05T10:00:00Z' },
  // Vendors
  { id: 'c1b2c3d4-0001-4000-8000-000000000001', full_name: 'Auto Parts Alger', phone_number: '+213 555 0301', role: UserRole.Vendor, created_at: '2024-01-01T10:00:00Z' },
  { id: 'c1b2c3d4-0002-4000-8000-000000000002', full_name: 'Assurance El Amane', phone_number: '+213 555 0302', role: UserRole.Vendor, created_at: '2024-01-05T10:00:00Z' },
];

const INITIAL_VEHICLES: Vehicle[] = [
  // 76 Market
  {
    id: 'v001',
    driver_id: 'a1b2c3d4-0001-4000-8000-000000000001',
    model_category: ModelCategory.Market76,
    plate_number: '00176-101-16',
    current_location: 'Bab Ezzouar, Algiers',
    libre_document_url: createSampleDocumentUrl('CARTE GRISE (LOGBOOK)', '00176-101-16', 'libre'),
    insurance_document_url: null,
    operational_status: OperationalStatus.InRoute,
    insurance_expiry_days: 0,
    libre_file_name: 'carte_grise_76_001.pdf',
    libre_file_size: '420 KB',
    libre_upload_date: 'Jan 15, 2026',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'v002',
    driver_id: 'a1b2c3d4-0002-4000-8000-000000000002',
    model_category: ModelCategory.Market76,
    plate_number: '00176-202-16',
    current_location: 'Hussein Dey, Algiers',
    libre_document_url: null,
    insurance_document_url: createSampleDocumentUrl('POLICE D\'ASSURANCE TOUS RISQUES', '00176-202-16', 'insurance'),
    operational_status: OperationalStatus.Available,
    insurance_expiry_days: 180,
    insurance_file_name: 'police_assurance_76_002.pdf',
    insurance_file_size: '680 KB',
    insurance_upload_date: 'Jan 16, 2026',
    created_at: '2024-01-16T10:00:00Z',
  },
  {
    id: 'v003',
    driver_id: 'a1b2c3d4-0003-4000-8000-000000000003',
    model_category: ModelCategory.Market76,
    plate_number: '00176-303-16',
    current_location: 'Kouba, Algiers',
    libre_document_url: createSampleDocumentUrl('CARTE GRISE (LOGBOOK)', '00176-303-16', 'libre'),
    insurance_document_url: createSampleDocumentUrl('POLICE D\'ASSURANCE TOUS RISQUES', '00176-303-16', 'insurance'),
    operational_status: OperationalStatus.InRoute,
    insurance_expiry_days: 95,
    libre_file_name: 'carte_grise_76_003.pdf',
    libre_file_size: '390 KB',
    libre_upload_date: 'Jan 17, 2026',
    insurance_file_name: 'assurance_76_003.pdf',
    insurance_file_size: '510 KB',
    insurance_upload_date: 'Jan 17, 2026',
    created_at: '2024-01-17T10:00:00Z',
  },

  // 78 Market
  {
    id: 'v004',
    driver_id: 'a1b2c3d4-0004-4000-8000-000000000004',
    model_category: ModelCategory.Market78,
    plate_number: '00178-101-16',
    current_location: 'Chéraga, Algiers',
    libre_document_url: null,
    insurance_document_url: null,
    operational_status: OperationalStatus.Maintenance,
    insurance_expiry_days: 0,
    created_at: '2024-02-01T10:00:00Z',
  },
  {
    id: 'v005',
    driver_id: 'a1b2c3d4-0005-4000-8000-000000000005',
    model_category: ModelCategory.Market78,
    plate_number: '00178-202-16',
    current_location: 'Dar El Beida, Algiers',
    libre_document_url: createSampleDocumentUrl('CARTE GRISE (LOGBOOK)', '00178-202-16', 'libre'),
    insurance_document_url: createSampleDocumentUrl('POLICE D\'ASSURANCE TOUS RISQUES', '00178-202-16', 'insurance'),
    operational_status: OperationalStatus.InRoute,
    insurance_expiry_days: 42,
    libre_file_name: 'carte_grise_78_005.pdf',
    libre_file_size: '410 KB',
    libre_upload_date: 'Feb 10, 2026',
    insurance_file_name: 'assurance_78_005.pdf',
    insurance_file_size: '590 KB',
    insurance_upload_date: 'Feb 10, 2026',
    created_at: '2024-02-10T10:00:00Z',
  },
  {
    id: 'v006',
    driver_id: 'a1b2c3d4-0006-4000-8000-000000000006',
    model_category: ModelCategory.Market78,
    plate_number: '00178-303-16',
    current_location: 'Rouiba, Algiers',
    libre_document_url: createSampleDocumentUrl('CARTE GRISE (LOGBOOK)', '00178-303-16', 'libre'),
    insurance_document_url: null,
    operational_status: OperationalStatus.Available,
    insurance_expiry_days: 0,
    libre_file_name: 'carte_grise_78_006.pdf',
    libre_file_size: '380 KB',
    libre_upload_date: 'Mar 01, 2026',
    created_at: '2024-03-01T10:00:00Z',
  },

  // 79 Pickup
  {
    id: 'v007',
    driver_id: 'a1b2c3d4-0007-4000-8000-000000000007',
    model_category: ModelCategory.Pickup79,
    plate_number: '00179-101-16',
    current_location: 'Blida City Center',
    libre_document_url: null,
    insurance_document_url: createSampleDocumentUrl('POLICE D\'ASSURANCE TOUS RISQUES', '00179-101-16', 'insurance'),
    operational_status: OperationalStatus.InRoute,
    insurance_expiry_days: 215,
    insurance_file_name: 'assurance_79_007.pdf',
    insurance_file_size: '720 KB',
    insurance_upload_date: 'Mar 15, 2026',
    created_at: '2024-03-15T10:00:00Z',
  },
  {
    id: 'v008',
    driver_id: 'a1b2c3d4-0008-4000-8000-000000000008',
    model_category: ModelCategory.Pickup79,
    plate_number: '00179-202-16',
    current_location: 'Boumerdès Port',
    libre_document_url: createSampleDocumentUrl('CARTE GRISE (LOGBOOK)', '00179-202-16', 'libre'),
    insurance_document_url: createSampleDocumentUrl('POLICE D\'ASSURANCE TOUS RISQUES', '00179-202-16', 'insurance'),
    operational_status: OperationalStatus.Available,
    insurance_expiry_days: 14,
    libre_file_name: 'carte_grise_79_008.pdf',
    libre_file_size: '440 KB',
    libre_upload_date: 'Apr 01, 2026',
    insurance_file_name: 'assurance_79_008.pdf',
    insurance_file_size: '630 KB',
    insurance_upload_date: 'Apr 01, 2026',
    created_at: '2024-04-01T10:00:00Z',
  },
];

// Persistent state loaders
const STORAGE_KEY_VEHICLES = 'fleet_mock_vehicles_v3';
const STORAGE_KEY_PROFILES = 'fleet_mock_profiles_v3';

function loadStoredVehicles(): Vehicle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VEHICLES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read vehicles from localStorage', e);
  }
  return INITIAL_VEHICLES;
}

function loadStoredProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read profiles from localStorage', e);
  }
  return INITIAL_PROFILES;
}

export let mockVehicles: Vehicle[] = loadStoredVehicles();
export let mockProfiles: Profile[] = loadStoredProfiles();

export function saveMockVehicles(updated: Vehicle[]) {
  mockVehicles = updated;
  try {
    localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(updated));
    window.dispatchEvent(new Event('fleet_storage_update'));
  } catch (e) {
    console.warn('Could not save vehicles to localStorage', e);
  }
}

export function saveMockProfiles(updated: Profile[]) {
  mockProfiles = updated;
  try {
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(updated));
    window.dispatchEvent(new Event('fleet_storage_update'));
  } catch (e) {
    console.warn('Could not save profiles to localStorage', e);
  }
}

export function getMockVehiclesWithDrivers(): VehicleWithDriver[] {
  return mockVehicles.map((vehicle) => ({
    ...vehicle,
    driver: mockProfiles.find((p) => p.id === vehicle.driver_id) || null,
  }));
}

export function getMockVehiclesByCategory(category: ModelCategory): VehicleWithDriver[] {
  return getMockVehiclesWithDrivers().filter((v) => v.model_category === category);
}

export function getMockProfilesByRole(role?: UserRole): Profile[] {
  if (!role) return mockProfiles;
  return mockProfiles.filter((p) => p.role === role);
}

export function getMockProfileById(id: string): Profile | undefined {
  return mockProfiles.find((p) => p.id === id);
}

export function getMockVehiclesByDriverId(driverId: string): VehicleWithDriver[] {
  return getMockVehiclesWithDrivers().filter((v) => v.driver_id === driverId);
}

export function getMockVehicleById(id: string): VehicleWithDriver | undefined {
  return getMockVehiclesWithDrivers().find((v) => v.id === id);
}
