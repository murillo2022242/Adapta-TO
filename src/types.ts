export interface ThemeColors {
  sage: string;
  forest: string;
  beige: string;
  white: string;
  graySoft: string;
  taupe: string;
  ink: string;
  inkMuted: string;
}

export interface DifferentialItem {
  title: string;
  description: string;
}

export interface SiteContent {
  clinicName: string;
  headerCtaText: string;
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryButton: string;
  heroSecondaryButton: string;
  introKicker: string;
  introTitle: string;
  introText: string;
  introHighlights: string;
  specialtiesSectionKicker: string;
  specialtiesSectionTitle: string;
  differentialsKicker: string;
  differentialsTitle: string;
  differentials: DifferentialItem[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;
  aboutKicker: string;
  aboutPageTitle: string;
  aboutHistory: string;
  aboutMission: string;
  aboutVision: string;
  aboutValues: string;
  aboutPhilosophy: string;
  aboutNotice: string;
  aboutTeamKicker: string;
  aboutTeamTitle: string;
  specialtiesPageKicker: string;
  specialtiesPageTitle: string;
  specialtiesPageSubtitle: string;
  professionalsPageKicker: string;
  professionalsPageTitle: string;
  professionalsPageSubtitle: string;
  bookingPageKicker: string;
  bookingPageTitle: string;
  bookingPageSubtitle: string;
  faqPageKicker: string;
  faqPageTitle: string;
  faqPageSubtitle: string;
  contactPageKicker: string;
  contactPageTitle: string;
  contactPageSubtitle: string;
  privacyPageKicker: string;
  privacyPageTitle: string;
  privacyPageSubtitle: string;
  footerTagline: string;
  footerBottomText: string;
}

export interface SiteImages {
  heroImage: string;
  aboutSpaceImage: string;
  aboutSessionImage: string;
  specialtiesBannerImage: string;
}

export interface ContactInfo {
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  hours: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  youtube: string;
  tiktok: string;
  whatsappAutoRedirect: boolean;
  timezone: string;
}

export interface AiSettings {
  enabled: boolean;
  assistantName: string;
  welcomeMessage: string;
  customInstructions: string;
}

export interface SiteSettings {
  theme: ThemeColors;
  content: SiteContent;
  images: SiteImages;
  contact: ContactInfo;
  ai: AiSettings;
}

export interface Specialty {
  id: number;
  slug: string;
  name: string;
  icon: string;
  shortDescription: string;
  fullDescription: string;
  targetAudience: string;
  objectives: string;
  howItWorks: string;
  confirmationStatus: 'confirmed' | 'to_confirm';
  active: boolean;
  sortOrder: number;
}

export interface WorkingDaySchedule {
  enabled: boolean;
  start: string;
  end: string;
  breakStart: string;
  breakEnd: string;
  slotMinutes: number;
}

export type WeeklySchedule = Record<string, WorkingDaySchedule>;

export interface Professional {
  id: number;
  name: string;
  specialtySummary: string;
  crfa: string;
  bio: string;
  photoUrl: string;
  active: boolean;
  workingHours: WeeklySchedule;
  specialtyIds: number[];
}

export interface BlockedDate {
  id: number;
  professionalId: number | null;
  professionalName?: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  reason: string;
  createdAt: string;
}

export type AppointmentStatus = 'pendente' | 'confirmado' | 'cancelado' | 'reagendado';

export interface Appointment {
  id: number;
  protocolCode: string;
  specialtyId: number;
  specialtyName?: string;
  professionalId: number;
  professionalName?: string;
  date: string;
  time: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  guardianName: string;
  lgpdConsent: boolean;
  notes: string;
  status: AppointmentStatus;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  active: boolean;
}

export interface KnowledgeItem {
  id: number;
  title: string;
  category: string;
  content: string;
  active: boolean;
  updatedAt: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  lgpdConsent: boolean;
  status: 'novo' | 'respondido';
  createdAt: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'professional';
  professionalId: number | null;
  active: boolean;
}

export interface DashboardStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  upcoming: Appointment[];
}

export interface DayAvailabilitySummary {
  date: string;
  availableCount: number;
  blocked: boolean;
  reason?: string;
}
