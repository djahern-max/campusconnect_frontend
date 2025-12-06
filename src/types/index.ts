// src/types/index.ts
// This file maps your existing type names to the generated OpenAPI types

import { components, operations } from './api';

// ============================================
// Authentication & Admin Types
// ============================================
export type Token = components['schemas']['Token'];
export type AdminUser = components['schemas']['AdminResponse'];
export type AdminLogin = components['schemas']['Body_login_api_v1_admin_auth_login_post'];
export type AdminRegister = components['schemas']['AdminRegister'];

// For backwards compatibility with existing code
export type LoginResponse = Token; // The login endpoint returns a Token

// ============================================
// Institution Types
// ============================================
export type Institution = components['schemas']['InstitutionResponse'];
export type InstitutionSummary = components['schemas']['InstitutionSummary'];
export type InstitutionComplete = components['schemas']['InstitutionComplete'];
export type InstitutionBasic = components['schemas']['InstitutionBasicResponse'];
export type PaginatedInstitutions = components['schemas']['PaginatedInstitutionResponse'];

// ============================================
// Scholarship Types
// ============================================
export type Scholarship = components['schemas']['ScholarshipResponse'];
export type ScholarshipCreate = components['schemas']['ScholarshipCreate'];
export type ScholarshipUpdate = components['schemas']['ScholarshipUpdate'];
export type PaginatedScholarships = components['schemas']['PaginatedScholarshipResponse'];

// ============================================
// Gallery/Image Types
// ============================================
export type EntityImage = components['schemas']['EntityImageResponse'];
export type EntityImageUpdate = components['schemas']['EntityImageUpdate'];

// ============================================
// Data Types
// ============================================
export type AdmissionData = components['schemas']['AdmissionDataResponse'];
export type AdmissionDataUpdate = components['schemas']['AdmissionDataUpdate'];
export type TuitionData = components['schemas']['TuitionDataResponse'];
export type TuitionDataUpdate = components['schemas']['TuitionDataUpdate'];

// ============================================
// Extended Info Types
// ============================================
export type InstitutionExtendedInfo = components['schemas']['InstitutionExtendedInfoResponse'];
export type InstitutionExtendedInfoUpdate = components['schemas']['InstitutionExtendedInfoUpdate'];

// ============================================
// Video Types
// ============================================
export type InstitutionVideo = components['schemas']['InstitutionVideoResponse'];
export type InstitutionVideoCreate = components['schemas']['InstitutionVideoCreate'];
export type InstitutionVideoUpdate = components['schemas']['InstitutionVideoUpdate'];

// ============================================
// Display Settings
// ============================================
export type DisplaySettings = components['schemas']['DisplaySettingsResponse'];
export type DisplaySettingsUpdate = components['schemas']['DisplaySettingsUpdate'];

// ============================================
// Contact Types
// ============================================
export type ContactInquiry = components['schemas']['ContactInquiryResponse'];
export type ContactInquiryCreate = components['schemas']['ContactInquiryCreate'];

// ============================================
// Invitation Types
// ============================================
export type InvitationCode = components['schemas']['InvitationCodeResponse'];
export type InvitationCodeCreate = components['schemas']['InvitationCodeCreate'];
export type InvitationValidate = components['schemas']['InvitationValidateResponse'];

// ============================================
// Outreach Types
// ============================================
export type Outreach = components['schemas']['OutreachResponse'];
export type OutreachCreate = components['schemas']['OutreachCreate'];
export type OutreachUpdate = components['schemas']['OutreachUpdate'];
export type OutreachStats = components['schemas']['OutreachStatsResponse'];

// ============================================
// Export the full generated types for advanced usage
// ============================================
export type { components, operations };