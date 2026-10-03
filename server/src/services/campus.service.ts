import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import { CampusLocationCategory, Prisma } from '@prisma/client';

// ── Seed Data for CUSTECH/FCI Campus Locations ────────────────────────────────
// Coordinates require admin configuration — all marked needsCoords=true by default.
// Admin must verify & update actual GPS coordinates via the admin panel.
export const DEFAULT_CAMPUS_LOCATIONS = [
  {
    name: 'Faculty of Computing and Informatics (FCI)',
    slug: 'fci-main',
    category: CampusLocationCategory.FACULTY,
    description: 'The main Faculty of Computing and Informatics building at CUSTECH Osara. Home to Computer Science, Information Technology, Cyber Security, and related departments.',
    building: 'FCI Complex',
    address: 'CUSTECH Main Campus, Osara, Kogi State',
    email: 'fci@custech.edu.ng',
  },
  {
    name: 'Department of Computer Science',
    slug: 'dept-computer-science',
    category: CampusLocationCategory.DEPARTMENT,
    description: 'The Computer Science department, offering BSc Computer Science programs focusing on algorithms, programming, AI, and software engineering.',
    building: 'FCI Complex',
    floor: 'Ground Floor',
    email: 'cs@custech.edu.ng',
  },
  {
    name: 'Department of Information Technology',
    slug: 'dept-information-technology',
    category: CampusLocationCategory.DEPARTMENT,
    description: 'The Information Technology department offering IT infrastructure, networking, systems administration, and enterprise technology programs.',
    building: 'FCI Complex',
    floor: 'Ground Floor',
  },
  {
    name: 'Department of Cyber Security',
    slug: 'dept-cyber-security',
    category: CampusLocationCategory.DEPARTMENT,
    description: 'The Cyber Security department offering specialized programs in network security, ethical hacking, digital forensics, and information assurance.',
    building: 'FCI Complex',
    floor: 'First Floor',
    email: 'cybersec@custech.edu.ng',
  },
  {
    name: 'FCI ICT Laboratory',
    slug: 'fci-ict-lab',
    category: CampusLocationCategory.ICT,
    description: 'The primary computing laboratory for FCI students with over 100 workstations, high-speed internet access, and specialized software for coding, design, and data analysis.',
    building: 'FCI Complex',
    floor: 'Ground Floor',
    room: 'Lab 1',
    openingHours: JSON.stringify({
      monday: '8:00 AM - 8:00 PM',
      tuesday: '8:00 AM - 8:00 PM',
      wednesday: '8:00 AM - 8:00 PM',
      thursday: '8:00 AM - 8:00 PM',
      friday: '8:00 AM - 6:00 PM',
      saturday: '9:00 AM - 4:00 PM',
      sunday: 'Closed',
    }),
  },
  {
    name: 'Advanced Research Laboratory',
    slug: 'fci-research-lab',
    category: CampusLocationCategory.LABORATORY,
    description: 'Graduate and final year research laboratory equipped with advanced computing resources, GPU workstations, and network simulation tools.',
    building: 'FCI Complex',
    floor: 'Second Floor',
    room: 'Research Lab',
  },
  {
    name: 'FCI Conference and Seminar Hall',
    slug: 'fci-seminar-hall',
    category: CampusLocationCategory.LECTURE_HALL,
    description: 'Multi-purpose conference hall for FCI seminars, project defenses, hackathons, and faculty-wide events. Capacity: 200 seats.',
    building: 'FCI Complex',
    floor: 'Ground Floor',
    room: 'Hall A',
  },
  {
    name: 'CUSTECH University Library',
    slug: 'custech-library',
    category: CampusLocationCategory.LIBRARY,
    description: 'The main university library with dedicated computing and ICT reference sections, research journals, e-library access, and quiet study areas.',
    building: 'Library Building',
    address: 'CUSTECH Main Campus, Osara, Kogi State',
    openingHours: {
      monday: '8:00 AM - 9:00 PM',
      tuesday: '8:00 AM - 9:00 PM',
      wednesday: '8:00 AM - 9:00 PM',
      thursday: '8:00 AM - 9:00 PM',
      friday: '8:00 AM - 6:00 PM',
      saturday: '10:00 AM - 4:00 PM',
      sunday: 'Closed',
    },
  },
  {
    name: 'Student Affairs Office',
    slug: 'student-affairs',
    category: CampusLocationCategory.STUDENT_SERVICE,
    description: 'Student affairs office handling student welfare, disciplinary matters, student union activities, and general student support services.',
    building: 'Administration Block',
    email: 'studentaffairs@custech.edu.ng',
    openingHours: {
      monday: '8:00 AM - 4:00 PM',
      tuesday: '8:00 AM - 4:00 PM',
      wednesday: '8:00 AM - 4:00 PM',
      thursday: '8:00 AM - 4:00 PM',
      friday: '8:00 AM - 3:00 PM',
      saturday: 'Closed',
      sunday: 'Closed',
    },
  },
  {
    name: 'CUSTECH Administration Building',
    slug: 'administration-building',
    category: CampusLocationCategory.ADMINISTRATION,
    description: 'Main university administration block. Houses the Vice Chancellor\'s office, Registrar, Bursary, and key administrative departments.',
    building: 'Administration Block',
    address: 'CUSTECH Main Campus, Osara, Kogi State',
  },
];

// ── Service Functions ─────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function seedCampusLocations() {
  const count = await prisma.campusLocation.count();
  if (count > 0) return;

  for (const loc of DEFAULT_CAMPUS_LOCATIONS) {
    await prisma.campusLocation.upsert({
      where: { slug: loc.slug },
      update: {},
      create: {
        ...loc,
        needsCoords: true,
        isActive: true,
      },
    });
  }
  console.log(`✅ Seeded ${DEFAULT_CAMPUS_LOCATIONS.length} campus locations`);
}

export async function getLocations(params: {
  category?: CampusLocationCategory;
  search?: string;
  page?: number;
  limit?: number;
  adminView?: boolean;
}) {
  const { category, search, page = 1, limit = 50, adminView = false } = params;

  const where: Prisma.CampusLocationWhereInput = {
    ...(adminView ? {} : { isActive: true }),
    ...(category ? { category } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
            { building: { contains: search } },
            { address: { contains: search } },
          ],
        }
      : {}),
  };

  const [locations, total] = await Promise.all([
    prisma.campusLocation.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.campusLocation.count({ where }),
  ]);

  return {
    locations,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getLocationBySlug(slug: string) {
  const location = await prisma.campusLocation.findUnique({
    where: { slug },
  });
  if (!location || !location.isActive) {
    throw ApiError.notFound('Campus location');
  }
  return location;
}

export async function createLocation(data: {
  name: string;
  description?: string;
  category: CampusLocationCategory;
  building?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  floor?: string;
  room?: string;
  phone?: string;
  email?: string;
  openingHours?: Record<string, string>;
  imageUrl?: string;
}) {
  const slug = slugify(data.name);
  const existing = await prisma.campusLocation.findUnique({ where: { slug } });
  if (existing) {
    throw ApiError.conflict(`A location with the slug "${slug}" already exists`);
  }

  return prisma.campusLocation.create({
    data: {
      ...data,
      slug,
      needsCoords: data.latitude == null || data.longitude == null,
      openingHours: data.openingHours as Prisma.InputJsonValue,
    },
  });
}

export async function updateLocation(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    category: CampusLocationCategory;
    building: string;
    latitude: number;
    longitude: number;
    address: string;
    floor: string;
    room: string;
    phone: string;
    email: string;
    openingHours: Record<string, string>;
    imageUrl: string;
    isActive: boolean;
  }>,
) {
  const location = await prisma.campusLocation.findUnique({ where: { id } });
  if (!location) throw ApiError.notFound('Campus location');

  const updateData: Prisma.CampusLocationUpdateInput = {
    ...data,
    ...(data.openingHours ? { openingHours: data.openingHours as Prisma.InputJsonValue } : {}),
  };

  // Recalculate needsCoords
  const lat = data.latitude ?? (location.latitude ? Number(location.latitude) : null);
  const lng = data.longitude ?? (location.longitude ? Number(location.longitude) : null);
  updateData.needsCoords = lat == null || lng == null;

  return prisma.campusLocation.update({ where: { id }, data: updateData });
}

export async function deleteLocation(id: string) {
  const location = await prisma.campusLocation.findUnique({ where: { id } });
  if (!location) throw ApiError.notFound('Campus location');
  // Soft delete
  return prisma.campusLocation.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function getCategories() {
  return Object.values(CampusLocationCategory).map((cat) => ({
    value: cat,
    label: cat
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase()),
  }));
}

export const CampusService = {
  seedCampusLocations,
  getLocations,
  getLocationBySlug,
  createLocation,
  updateLocation,
  deleteLocation,
  getCategories,
};
