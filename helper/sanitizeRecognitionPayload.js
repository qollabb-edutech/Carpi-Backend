const BUCKET = process.env.AWS_S3_BUCKET;
const REGION = process.env.AWS_REGION;

export const FIELD_LIMITS = {
  full_name: 255,
  designation: 255,
  institution: 255,
  department: 255,
  city_state: 100,
  official_email: 255,
  mobile_number: 20,
  linkedin_url: 500,
  google_scholar_url: 500,
  orcid: 50,
  researchgate_url: 500,
  scopus_id: 50,
  institution_profile_url: 500,
  personal_website_url: 500,
  highest_qualification: 255,
  primary_research_area: 255,
  broad_category_id: 100,
  broad_category_title: 255,
  sub_category_id: 100,
  sub_category_title: 255,
};

const APPLICANT_KEYS = new Set([
  "full_name",
  "designation",
  "institution",
  "department",
  "city_state",
  "official_email",
  "mobile_number",
  "linkedin_url",
  "google_scholar_url",
  "orcid",
  "researchgate_url",
  "scopus_id",
  "institution_profile_url",
  "personal_website_url",
]);

const PROFESSIONAL_KEYS = new Set([
  "highest_qualification",
  "years_of_experience",
  "primary_research_area",
  "areas_of_expertise",
  "professional_biography",
  "major_achievements",
]);

const TEXT_AREA_KEYS = new Set([
  "areas_of_expertise",
  "professional_biography",
  "major_achievements",
]);

const MAX_TEXTAREA_LENGTH = 50000;
const MAX_FLOW_TEXT_LENGTH = 50000;
const MAX_ACHIEVEMENT_TEXT = 10000;

function truncate(value, max) {
  if (value === null || value === undefined) return value;
  const str = String(value);
  return str.length > max ? str.slice(0, max) : str;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function buildExpectedS3UrlPrefix() {
  if (!BUCKET || !REGION) return null;
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/`;
}

export function isAllowedS3FileReference(file = {}) {
  const prefix = buildExpectedS3UrlPrefix();
  const key = file.key || file.stored_name;
  const url = file.url || file.file_url;

  if (!prefix || !key) return false;
  if (!/^(images|videos|documents)\/[a-zA-Z0-9._-]+$/.test(String(key))) return false;
  if (!url || !url.startsWith(prefix)) return false;
  if (!url.includes(key)) return false;

  return true;
}

export function sanitizeRecognitionPayload(payload = {}) {
  const errors = [];
  const sanitized = { ...payload };

  sanitized.broad_category_id = truncate(payload.broad_category_id, FIELD_LIMITS.broad_category_id);
  sanitized.broad_category_title = truncate(payload.broad_category_title, FIELD_LIMITS.broad_category_title);
  sanitized.sub_category_id = truncate(payload.sub_category_id, FIELD_LIMITS.sub_category_id);
  sanitized.sub_category_title = truncate(payload.sub_category_title, FIELD_LIMITS.sub_category_title);

  const applicant = payload.applicant || {};
  sanitized.applicant = {};
  APPLICANT_KEYS.forEach((key) => {
    if (applicant[key] !== undefined && applicant[key] !== "") {
      sanitized.applicant[key] = truncate(applicant[key], FIELD_LIMITS[key] || 255);
    }
  });

  if (sanitized.applicant.official_email && !isValidEmail(sanitized.applicant.official_email)) {
    errors.push("Official email is invalid");
  }

  const professional = payload.professional || {};
  sanitized.professional = {};
  PROFESSIONAL_KEYS.forEach((key) => {
    if (professional[key] === undefined || professional[key] === "") return;
    if (key === "years_of_experience") {
      const num = parseInt(professional[key], 10);
      sanitized.professional[key] = Number.isFinite(num) ? Math.min(Math.max(num, 0), 80) : null;
      return;
    }
    const max = TEXT_AREA_KEYS.has(key) ? MAX_TEXTAREA_LENGTH : FIELD_LIMITS[key] || 255;
    sanitized.professional[key] = truncate(professional[key], max);
  });

  const flowData = payload.flow_data || {};
  sanitized.flow_data = {};
  Object.entries(flowData).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === "string") {
      sanitized.flow_data[key] = truncate(value, MAX_FLOW_TEXT_LENGTH);
    } else {
      sanitized.flow_data[key] = value;
    }
  });

  if (payload.commercialisation) {
    sanitized.commercialisation = {
      ...payload.commercialisation,
      assistance_looking_for: truncate(payload.commercialisation.assistance_looking_for, 255),
      financial_expectations: truncate(payload.commercialisation.financial_expectations, MAX_TEXTAREA_LENGTH),
      confidentiality_level: truncate(payload.commercialisation.confidentiality_level, 50),
      preferred_models: Array.isArray(payload.commercialisation.preferred_models)
        ? payload.commercialisation.preferred_models.slice(0, 20).map((m) => truncate(m, 100))
        : [],
    };
  }

  if (payload.institution_research) {
    sanitized.institution_research = {};
    Object.entries(payload.institution_research).forEach(([key, value]) => {
      sanitized.institution_research[key] = truncate(value, MAX_TEXTAREA_LENGTH);
    });
  }

  sanitized.additional_achievements = Array.isArray(payload.additional_achievements)
    ? payload.additional_achievements.slice(0, 20).map((item) => ({
        achievement_type: truncate(item.achievement_type, 255),
        title: truncate(item.title, 255),
        year: truncate(item.year, 10),
        description: truncate(item.description, MAX_ACHIEVEMENT_TEXT),
      }))
    : [];

  sanitized.collaboration_interests = Array.isArray(payload.collaboration_interests)
    ? payload.collaboration_interests.slice(0, 20).map((item) => truncate(item, 100))
    : [];

  sanitized.files = Array.isArray(payload.files)
    ? payload.files.filter((file) => {
        if (!file?.url && !file?.key) return false;
        if (!isAllowedS3FileReference(file)) {
          errors.push(`Invalid file reference for ${file.field_key || "unknown"}`);
          return false;
        }
        return true;
      })
    : [];

  sanitized.declarations = payload.declarations || {};

  return { sanitized, errors };
}

export function getFieldMaxLength(fieldName) {
  if (TEXT_AREA_KEYS.has(fieldName)) return MAX_TEXTAREA_LENGTH;
  return FIELD_LIMITS[fieldName] || undefined;
}
