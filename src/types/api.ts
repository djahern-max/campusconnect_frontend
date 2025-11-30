// src/types/api.ts - UPDATED with Scholarship support

export interface Institution {
  // Core Identity Fields
  id: number;
  ipeds_id: number;
  name: string;
  city: string;
  state: string; // 2-letter code
  control_type: 'PUBLIC' | 'PRIVATE_NONPROFIT' | 'PRIVATE_FOR_PROFIT';

  // Display & Media
  primary_image_url: string | null;
  website: string | null;

  // Academic Characteristics
  student_faculty_ratio: number | null;
  size_category: string | null;
  locale: string | null;
  level: number | null;
  control: number | null;

  // Cost Information (in institutions table)
  tuition_in_state: number | null;
  tuition_out_of_state: number | null;
  tuition_private: number | null;
  tuition_in_district: number | null;
  room_cost: number | null;
  board_cost: number | null;
  room_and_board: number | null;
  application_fee_undergrad: number | null;
  application_fee_grad: number | null;

  // Admissions Statistics (in institutions table)
  acceptance_rate: number | null;
  sat_reading_25th: number | null;
  sat_reading_75th: number | null;
  sat_math_25th: number | null;
  sat_math_75th: number | null;
  act_composite_25th: number | null;
  act_composite_75th: number | null;

  // Data Management & Verification
  data_completeness_score: number;
  completeness_score: number;
  data_source: string;
  ipeds_year: string;
  is_featured: boolean;
  admin_verified: boolean;
  cost_data_verified: boolean;
  cost_data_verified_at: string | null;
  admissions_data_verified: boolean;
  admissions_data_verified_at: string | null;
  last_admin_update: string | null;
  data_quality_notes: string | null;
  data_last_updated: string;

  // System Fields
  created_at: string;
  updated_at: string;
}

// NEW: Complete Scholarship interface matching your backend
export interface Scholarship {
  id: number;
  title: string;  // was 'name'
  organization: string;
  scholarship_type: string;
  status: string;
  difficulty_level: string;
  amount_min: number;
  amount_max: number;
  is_renewable: boolean;
  number_of_awards?: number;
  deadline?: string;  // was 'application_deadline'
  application_opens?: string;
  for_academic_year?: string;
  description?: string;
  website_url?: string;  // was 'more_info_url'
  min_gpa?: number;  // was 'gpa_requirement'
  primary_image_url?: string;
  verified: boolean;
  featured: boolean;
  views_count: number;
  applications_count: number;
  created_at: string;
  updated_at?: string;
}

// NEW: For scholarship update requests
export interface ScholarshipUpdateRequest {
  name?: string;
  organization?: string | null;
  description?: string | null;
  amount_min?: number | null;
  amount_max?: number | null;
  is_renewable?: boolean;
  gpa_requirement?: number | null;
  citizenship_requirements?: string | null;
  field_of_study?: string | null;
  application_deadline?: string | null;
  notification_date?: string | null;
  application_url?: string | null;
  more_info_url?: string | null;
}

// UPDATED: AdminUser with all fields
export interface AdminUser {
  id: number;
  email: string;
  entity_type: 'institution' | 'scholarship';
  entity_id: number;
  role?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

// NEW: Profile entity response (what /api/v1/admin/profile/entity returns)
export interface ProfileEntityResponse {
  admin_user: AdminUser;
  institution?: Institution;
  scholarship?: Scholarship;
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

export interface EntityImage {
  id: number;
  entity_type: 'institution' | 'scholarship';
  entity_id: number;
  image_url: string;
  cdn_url: string;
  filename: string;
  caption: string | null;
  display_order: number;
  is_featured: boolean;
  image_type: string | null;
  created_at: string;
  updated_at: string | null;
}

// Keep InstitutionImage as an alias for backwards compatibility
export type InstitutionImage = EntityImage;

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

// UPDATED: LoginResponse now includes admin_user
export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  admin_user: AdminUser;
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

// Historical data tables (separate from institutions table)
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

export interface ImageReorderRequest {
  image_ids: number[];
}

export interface SetFeaturedImageRequest {
  image_id: number;
}

// NEW: Scholarship-specific statistics (for dashboard)
export interface ScholarshipStatistics {
  total_scholarships: number;
  active_scholarships: number;
  pending_scholarships: number;
  expired_scholarships: number;
  total_amount_awarded: number;
}