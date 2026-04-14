const { normalizeText, getLines } = require('../utils/textExtractor');
const { extractSkills } = require('../utils/skillExtractor');

// ─────────────────────────────────────────────
// Name Extraction
// ─────────────────────────────────────────────

/**
 * Heuristic name extraction:
 * 1. Look for explicit "Name:" label.
 * 2. Fall back to the first non-empty line that looks like a person's name
 *    (2-4 capitalised words, no numbers, not a common header).
 */
function extractName(text) {
  const lines = getLines(text);

  // Pattern 1: "Name: John Doe"
  const labelPattern = /^(?:name\s*[:\-]?\s*)([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+){1,3})$/im;
  const labelMatch = text.match(labelPattern);
  if (labelMatch) return labelMatch[1].trim();

  // Pattern 2: First line that looks like a proper name
  const headerKeywords = new Set([
    'resume', 'curriculum vitae', 'cv', 'profile', 'summary', 'objective',
    'experience', 'education', 'skills', 'contact', 'references',
  ]);

  for (const line of lines.slice(0, 8)) {
    const clean = line.trim();
    if (!clean) continue;
    if (headerKeywords.has(clean.toLowerCase())) continue;
    // Allow 2-4 words, each starting with uppercase, no digits
    const nameRe = /^[A-Z][a-zA-Z'-]{1,30}(?:\s[A-Z][a-zA-Z'-]{1,30}){1,3}$/;
    if (nameRe.test(clean)) return clean;
  }

  return 'Unknown';
}

// ─────────────────────────────────────────────
// Email & Phone Extraction
// ─────────────────────────────────────────────

function extractEmail(text) {
  const match = text.match(/[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

function extractPhone(text) {
  const match = text.match(/(\+?\d[\d\s\-().]{8,16}\d)/);
  return match ? match[1].replace(/\s+/g, ' ').trim() : null;
}

// ─────────────────────────────────────────────
// Experience Extraction
// ─────────────────────────────────────────────

/**
 * Extract years of experience from resume text.
 * Strategies:
 *  1. Explicit mention: "5 years of experience", "3+ yrs"
 *  2. Date range calculation from work history sections
 */
function extractExperience(text) {
  const lower = text.toLowerCase();

  // Strategy 1 – explicit statement
  const explicitPatterns = [
    /(\d+(?:\.\d+)?)\s*\+?\s*years?\s+of\s+(?:professional\s+)?(?:work\s+)?experience/i,
    /(\d+(?:\.\d+)?)\+?\s*yrs?\s+(?:of\s+)?(?:professional\s+)?experience/i,
    /experience\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*\+?\s*years?/i,
    /(\d+(?:\.\d+)?)\s*\+?\s*years?\s+(?:industry|relevant|work|professional)/i,
  ];

  for (const re of explicitPatterns) {
    const m = text.match(re);
    if (m) return parseFloat(m[1]);
  }

  // Strategy 2 – fresher/entry keywords
  if (/\b(fresher|entry.?level|0\s*years?|no experience)\b/i.test(lower)) return 0;

  // Strategy 3 – calculate from date ranges in work history
  return calculateExperienceFromDates(text);
}

function calculateExperienceFromDates(text) {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Match patterns like "Jan 2018 – Present", "2019 - 2022", "March 2020 to current"
  const dateRangeRe = /(\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)?\.?\s*(\d{4}))\s*(?:[-–—]|to)\s*(present|current|now|(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)?\.?\s*(\d{4}))/gi;

  let earliest = null;
  let latest = null;

  let match;
  while ((match = dateRangeRe.exec(text)) !== null) {
    const startYear = parseInt(match[2]);
    const endToken = match[3].trim().toLowerCase();
    const endYear = /present|current|now/.test(endToken)
      ? currentYear
      : parseInt(match[4] || currentYear);

    if (!isNaN(startYear) && startYear >= 1980 && startYear <= currentYear) {
      if (earliest === null || startYear < earliest) earliest = startYear;
    }
    if (!isNaN(endYear) && endYear >= 1980 && endYear <= currentYear + 1) {
      if (latest === null || endYear > latest) latest = endYear;
    }
  }

  if (earliest !== null && latest !== null && latest >= earliest) {
    return Math.round((latest - earliest) * 10) / 10;
  }

  return null; // Cannot determine
}

// ─────────────────────────────────────────────
// Main Parser
// ─────────────────────────────────────────────

/**
 * Parse a resume from extracted plain text.
 * @param {string} text
 * @returns {object} Parsed resume data
 */
function parseResume(text) {
  return {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    yearOfExperience: extractExperience(text),
    resumeSkills: extractSkills(text),
  };
}

module.exports = { parseResume, extractName, extractEmail, extractPhone, extractExperience };
