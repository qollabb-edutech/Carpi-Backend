const LEADERSHIP_SUBCATEGORIES = new Set([
  "vice-chancellor",
  "chancellor",
  "director",
  "dean",
  "training-placement-head",
  "head-of-department",
  "research-centre-head",
]);

const INSTITUTION_ACHIEVEMENT_SUBCATEGORIES = new Set([
  "university-achievement",
  "department-achievement",
  "research-centre-achievement",
]);

const IP_SUBCATEGORIES = new Set([
  "patent-filed",
  "patent-granted",
  "copyright-registered",
  "trademark-registered",
  "industrial-design-registered",
]);

const SUB_CATEGORY_FLOW_MAP = {
  "research-commercialisation-potential": "A",
  "technology-ready-licensing": "B",
  "applied-research": "C",
  "startup-spin-off": "A2",
  "published-research-paper": "D",
  "published-book": "E",
  "completed-research-project": "F",
  "research-grant-awarded": "G",
  "technology-developed": "I",
};

export function getFlowIdForSubCategory(subCategoryId) {
  if (SUB_CATEGORY_FLOW_MAP[subCategoryId]) {
    return SUB_CATEGORY_FLOW_MAP[subCategoryId];
  }
  if (IP_SUBCATEGORIES.has(subCategoryId)) return "H";
  if (LEADERSHIP_SUBCATEGORIES.has(subCategoryId)) return "J";
  if (INSTITUTION_ACHIEVEMENT_SUBCATEGORIES.has(subCategoryId)) return "J2";
  return null;
}

export function requiresCommercialisationSection(subCategoryId, flowData = {}) {
  if (subCategoryId === "research-commercialisation-potential") return true;
  if (subCategoryId === "published-research-paper" && flowData.has_commercialisation_potential === true) return true;
  if (subCategoryId === "published-book" && flowData.can_be_commercialised === true) return true;
  if (IP_SUBCATEGORIES.has(subCategoryId) && flowData.help_commercialize_ip === true) return true;
  return false;
}

export function requiresInstitutionResearchSection(subCategoryId, flowData = {}) {
  if (LEADERSHIP_SUBCATEGORIES.has(subCategoryId) && flowData.identify_commercial_research === true) {
    return true;
  }
  return false;
}

export { LEADERSHIP_SUBCATEGORIES, INSTITUTION_ACHIEVEMENT_SUBCATEGORIES, IP_SUBCATEGORIES };
