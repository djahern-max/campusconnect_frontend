// CampusConnect API TypeScript Interfaces
// Based on your backend API

export interface Institution {
  id: number;
  ipeds_id: number;
  name: string;
  city: string;
  state: string;
  control_type: 'PUBLIC' | 'PRIVATE_NONPROFIT' | 'PRIVATE_FOR_PROFIT';
  primary_image_url: string | null;
  student_faculty_ratio: number | null;
  size_category: string | null;
  locale: string | null;
  created_at: string;
  updated_at: string;
}

export interface Scholarship {
  id: number;
  title: string;
  organization: string;
  scholarship_type: string;
  status: string;
  difficulty_level: string;
  amount_min: number;
  amount_max: number;
  is_renewable: boolean;
  deadline: string | null;
  description: string | null;
  website_url: string | null;
  min_gpa: number | null;
  primary_image_url: string | null;
  created_at: string;
}

export interface AdminUser {
  id: number;
  email: string;
  entity_type: 'institution' | 'scholarship';
  entity_id: number;
  role: string;
  is_active: boolean;
}

export interface DisplaySettings {
  id: number;
  entity_type: 'institution' | 'scholarship';
  entity_id: number;
  show_stats: boolean;
  show_financial: boolean;
  show_requirements: boolean;
  show_image_gallery: boolean;
  show_video: boolean;
  show_extended_info: boolean;
  custom_tagline: string | null;
  custom_description: string | null;
  extended_description: string | null;
  layout_style: string;
  primary_color: string | null;
}

export interface InstitutionImage {
  id: number;
  institution_id: number;
  image_url: string;
  cdn_url: string;
  filename: string;
  caption: string | null;
  display_order: number;
  is_featured: boolean;
  image_type: string | null;
  created_at: string;
}

export interface InstitutionVideo {
  id: number;
  institution_id: number;
  video_url: string;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  video_type: string | null;
  display_order: number;
  is_featured: boolean;
  created_at: string;
}

export interface ExtendedInfo {
  id: number;
  institution_id: number;
  campus_description: string | null;
  academic_programs: string | null;
  student_life: string | null;
  athletics: string | null;
  housing: string | null;
  dining: string | null;
  campus_safety: string | null;
  career_services: string | null;
  study_abroad: string | null;
  research_opportunities: string | null;
  clubs_organizations: string | null;
  diversity_inclusion: string | null;
  sustainability: string | null;
  notable_alumni: string | null;
  custom_sections: CustomSection[] | null;
  created_at: string;
  updated_at: string;
}

export interface CustomSection {
  title: string;
  content: string;
  order: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface Subscription {
  id: number;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface CheckoutSession {
  session_id: string;
  session_url: string;
}

export interface AdmissionData {
  id: number;
  institution_id: number;
  ipeds_id: number;
  academic_year: string;
  applications_total: number | null;
  admissions_total: number | null;
  enrolled_total: number | null;
  acceptance_rate: number | null;
  yield_rate: number | null;
  sat_reading_25th: number | null;
  sat_reading_50th: number | null;
  sat_reading_75th: number | null;
  sat_math_25th: number | null;
  sat_math_50th: number | null;
  sat_math_75th: number | null;
  percent_submitting_sat: number | null;
  is_admin_verified: boolean;
  created_at: string;
}

export interface TuitionData {
  id: number;
  institution_id: number;
  ipeds_id: number;
  academic_year: string;
  data_source: string | null;
  tuition_in_state: number | null;
  tuition_out_state: number | null;
  required_fees_in_state: number | null;
  required_fees_out_state: number | null;
  room_board_on_campus: number | null;
  is_admin_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinancialOverview {
  ipeds_id: number;
  tuition: TuitionData | null;
  admissions: AdmissionData | null;
}

export interface AdmissionDataUpdate {
  applications_total?: number;
  admissions_total?: number;
  enrolled_total?: number;
  acceptance_rate?: number;
  yield_rate?: number;
  sat_reading_25th?: number;
  sat_reading_50th?: number;
  sat_reading_75th?: number;
  sat_math_25th?: number;
  sat_math_50th?: number;
  sat_math_75th?: number;
  percent_submitting_sat?: number;
  is_admin_verified?: boolean;
}

export interface TuitionDataUpdate {
  tuition_in_state?: number;
  tuition_out_state?: number;
  required_fees_in_state?: number;
  required_fees_out_state?: number;
  room_board_on_campus?: number;
  data_source?: string;
  is_admin_verified?: boolean;
}
export interface AdmissionDataUpdate {
  applications_total?: number;
  admissions_total?: number;
  enrolled_total?: number;
  acceptance_rate?: number;
  yield_rate?: number;
  sat_reading_25th?: number;
  sat_reading_50th?: number;
  sat_reading_75th?: number;
  sat_math_25th?: number;
  sat_math_50th?: number;
  sat_math_75th?: number;
  percent_submitting_sat?: number;
  is_admin_verified?: boolean;
}

export interface TuitionDataUpdate {
  tuition_in_state?: number;
  tuition_out_state?: number;
  required_fees_in_state?: number;
  required_fees_out_state?: number;
  room_board_on_campus?: number;
  data_source?: string;
  is_admin_verified?: boolean;
}

export interface Scholarship {
  id: number;
  title: string;
  organization: string;
  scholarship_type: string;
  status: string;
  difficulty_level: string;
  amount_min: number;
  amount_max: number;
  is_renewable: boolean;
  number_of_awards: number | null;
  deadline: string | null;
  application_opens: string | null;
  for_academic_year: string | null;
  description: string | null;
  website_url: string | null;
  min_gpa: number | null;
  primary_image_url: string | null;
  verified: boolean;
  featured: boolean;
  views_count: number;
  applications_count: number;
  created_at: string;
  updated_at: string | null;
}
