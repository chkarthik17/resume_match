const { getLines } = require('../utils/textExtractor');
const { extractSkills } = require('../utils/skillExtractor');

function normaliseDashes(text) {
  return text.replace(/[\u2014\u2013]/g, '-').replace(/--+/g, '-');
}

function compact(value, maxLength = 140) {
  if (!value) return null;
  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength)}...` : cleaned;
}

/**
 * Extract salary information from JD text.
 * Handles Indian LPA/CTC, rupee amounts, USD ranges, numeric compensation
 * ranges, hourly-to-annual ranges, and level-based compensation blocks.
 */
function extractSalary(text) {
  const t = normaliseDashes(text);

  const patterns = [
    /(?:ctc|salary|compensation|pay)\s*[:\-]?\s*(?:\u20b9|rs\.?|inr)?\s*\d+(?:[.,]\d+)*\s*(?:to|-)?\s*\d*(?:[.,]\d+)*\s*(?:lpa|l\.p\.a|lakhs?\s*per\s*annum|lakhs?)/i,
    /(?:\u20b9|rs\.?|inr)\s*\d+(?:[.,]\d+)*\s*(?:to|-)?\s*\d*(?:[.,]\d+)*\s*(?:per\s*annum|pa|\/yr|\/year)?/i,
    /\d+(?:\.\d+)?\s*(?:to|-)\s*\d+(?:\.\d+)?\s*(?:lpa|l\.p\.a)/i,
    /\$\s*\d+(?:\.\d+)?\s*\/hour\s*to\s*\$\s*\d{2,3}(?:,\d{3})*\s*\/year/i,
    /(?:salary|pay|compensation)\s*[:\-]?\s*\$\s*\d{5,}(?:\.\d{2})?\s*-\s*\$?\s*\d{5,}(?:\.\d{2})?\s*(?:per\s*year|\/year|\/yr|usd)?/i,
    /\$\s*\d{2,3}(?:,\d{3})*(?:\.\d+)?\s*-\s*\$?\s*\d{2,3}(?:,\d{3})*(?:\.\d+)?\s*(?:per\s*year|\/year|annually|\/yr|per\s*annum|usd)?/i,
    /(?:salary|pay|compensation)\s*[:\-]?\s*\$\s*\d{2,3}(?:,\d{3})*(?:\.\d{2})?/i,
    /(?:compensation\s*range|pay\s*range|base\s*(?:pay|salary|compensation))[^$\d\n]{0,80}\d{5,}\s*-\s*\d{5,}/i,
    /level\s+[iivx]+\s*:\s*\$\s*\d{2,3}(?:,\d{3})*(?:\.\d+)?\s*-\s*\$?\s*\d{2,3}(?:,\d{3})*(?:\.\d+)?\s*(?:\/per\s*year|per\s*year|\/year|\/yr)?/i,
  ];

  for (const re of patterns) {
    const match = t.match(re);
    if (match) return compact(match[0]);
  }

  return null;
}

/**
 * Extract required years of experience from JD text.
 * If several explicit values are present, return the highest minimum value
 * because JDs often list skill-specific experience as well as total experience.
 */
function extractExperience(text) {
  const t = normaliseDashes(text);
  const years = [];

  const patterns = [
    /(\d+(?:\.\d+)?)\s*\+?\s*years?\s+of\s+(?:strong\s+)?(?:hands?-?on\s+)?(?:relevant\s+)?(?:professional\s+)?experience/gi,
    /(\d+(?:\.\d+)?)\s*\+?\s*yrs?\s+(?:of\s+)?(?:relevant\s+)?experience/gi,
    /(?:bachelor(?:'s)?|master(?:'s)?|phd|bs|ms)\s+with\s+(\d+(?:\.\d+)?)\s*\+?\s*years?/gi,
    /(\d+(?:\.\d+)?)\s*-\s*\d+(?:\.\d+)?\s*\+?\s*years?\s+(?:of\s+)?(?:relevant\s+|related\s+)?(?:experience|exp)/gi,
    /minimum\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*\+?\s*years?/gi,
    /(\d+(?:\.\d+)?)\s*\+\s*years?/gi,
  ];

  for (const re of patterns) {
    let match;
    while ((match = re.exec(t)) !== null) {
      years.push(parseFloat(match[1]));
    }
  }

  if (years.length > 0) return Math.max(...years);
  if (/\b(fresher|entry.?level)\b/i.test(t)) return 0;

  return null;
}

/**
 * Extract a short "About Role" summary from overview/description sections.
 */
function extractRoleSummary(text) {
  const lines = getLines(text);

  const summaryHeaders = [
    /^(?:job\s+)?(?:description|overview|summary|about\s+(?:the\s+)?(?:role|position|job|opportunity))$/i,
    /^position\s+overview$/i,
    /^the\s+opportunity$/i,
    /^role\s+(?:overview|summary|description)$/i,
  ];

  const stopHeaders = [
    /^responsibilities$/i,
    /^job\s+responsibilities$/i,
    /^qualifications$/i,
    /^required\s+qualifications$/i,
    /^desired\s+qualifications$/i,
    /^good\s+to\s+have$/i,
    /^global\s+comp$/i,
  ];

  for (let i = 0; i < lines.length; i++) {
    if (!summaryHeaders.some(re => re.test(lines[i].trim()))) continue;

    const para = [];
    for (let j = i + 1; j < Math.min(i + 18, lines.length); j++) {
      const line = lines[j].trim();
      if (!line || /^[*\u2022-]/.test(line)) continue;
      if (stopHeaders.some(re => re.test(line))) break;
      para.push(line);
      if (para.join(' ').length > 300) break;
    }

    if (para.length > 0) return compact(para.join(' '), 400);
  }

  const fallback = lines.find(line => line.length > 80 && !/^[*\u2022-]/.test(line));
  return compact(fallback, 400) || 'No summary available.';
}

/**
 * Split extracted skills into required and optional buckets by section header.
 */
function splitRequiredOptionalSkills(text, allSkills) {
  const optionalSectionRe = /\b(good\s+to\s+have|desired\s+qualifications?|preferred\s+qualifications?|optional\s+skills?|nice\s+to\s+have|desired\s+skills?|desired\s+multipliers?|bonus|what\s+we'd\s+like)\b/i;
  const optionalStart = text.search(optionalSectionRe);

  if (optionalStart === -1) {
    return { required: allSkills, optional: [] };
  }

  const requiredText = text.slice(0, optionalStart);
  const optionalText = text.slice(optionalStart);
  const required = extractSkills(requiredText);
  const optional = extractSkills(optionalText).filter(skill => !required.includes(skill));

  return { required, optional };
}

function inferRole(text) {
  const patterns = [
    /(?:position|role|title|job\s+title)\s*[:\-]\s*(.+)/i,
    /(?:seeking|hiring|looking\s+for)\s+(?:a\s+|an\s+)?(.{5,80}?)\s+(?:to|who|that)/i,
    /^(.{5,80}?)\s*\n/,
  ];

  for (const re of patterns) {
    const match = text.match(re);
    if (!match) continue;

    const candidate = match[1].trim().replace(/\.$/, '');
    if (candidate.length < 90) return candidate;
  }

  return 'Software Engineer';
}

/**
 * Parse a Job Description from plain text.
 *
 * @param {string} text - JD plain text
 * @param {string} jobId - Identifier
 * @param {string} role - Role name
 * @returns {object} Parsed JD data
 */
function parseJD(text, jobId = 'JD001', role = null) {
  const allSkills = extractSkills(text);
  const { required, optional } = splitRequiredOptionalSkills(text, allSkills);

  return {
    jobId,
    role: role || inferRole(text),
    aboutRole: extractRoleSummary(text),
    salary: extractSalary(text),
    yearsOfExperience: extractExperience(text),
    requiredSkills: required,
    optionalSkills: optional,
    allSkills,
  };
}

module.exports = {
  parseJD,
  extractSalary,
  extractExperience,
  extractRoleSummary,
  splitRequiredOptionalSkills,
};
