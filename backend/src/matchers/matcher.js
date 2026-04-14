/**
 * Matching Engine
 * ---------------
 * Computes how well a parsed resume matches one or more parsed JDs.
 * Score = (Matched JD Skills / Total JD Skills) * 100
 */

/**
 * Normalise a skill name for comparison.
 */
function normalise(skill) {
  return skill.toLowerCase().replace(/[.\-/\s]+/g, '');
}

/**
 * Build a fast lookup set from an array of skill strings.
 */
function buildSkillSet(skills) {
  return new Set(skills.map(normalise));
}

/**
 * Match a resume against a single parsed JD.
 *
 * @param {object} parsedResume - Output of resumeParser.parseResume
 * @param {object} parsedJD - Output of jdParser.parseJD
 * @returns {object} Match result in the required output format
 */
function matchResumeToJD(parsedResume, parsedJD) {
  const resumeSkillSet = buildSkillSet(parsedResume.resumeSkills);
  const jdSkills = parsedJD.allSkills;

  if (jdSkills.length === 0) {
    return {
      jobId: parsedJD.jobId,
      role: parsedJD.role,
      salary: parsedJD.salary,
      yearsOfExperience: parsedJD.yearsOfExperience,
      aboutRole: parsedJD.aboutRole,
      requiredSkills: parsedJD.requiredSkills,
      optionalSkills: parsedJD.optionalSkills,
      skillsAnalysis: [],
      matchingScore: 0,
      matchedSkillCount: 0,
      totalJDSkills: 0,
    };
  }

  const skillsAnalysis = jdSkills.map(skill => ({
    skill,
    presentInResume: resumeSkillSet.has(normalise(skill)),
    isRequired: parsedJD.requiredSkills.includes(skill),
  }));

  const matched = skillsAnalysis.filter(s => s.presentInResume).length;
  const finalScore = Math.min(100, Math.round((matched / jdSkills.length) * 100));

  return {
    jobId: parsedJD.jobId,
    role: parsedJD.role,
    salary: parsedJD.salary,
    yearsOfExperience: parsedJD.yearsOfExperience,
    aboutRole: parsedJD.aboutRole,
    requiredSkills: parsedJD.requiredSkills,
    optionalSkills: parsedJD.optionalSkills,
    skillsAnalysis,
    matchingScore: finalScore,
    matchedSkillCount: matched,
    totalJDSkills: jdSkills.length,
  };
}

/**
 * Match a resume against multiple JDs, sorted by score descending.
 *
 * @param {object} parsedResume - Output of resumeParser.parseResume
 * @param {object[]} parsedJDs - Array of parseJD outputs
 * @returns {object} Final output JSON as per assignment spec
 */
function matchResumeToJDs(parsedResume, parsedJDs) {
  const matchingJobs = parsedJDs
    .map(jd => matchResumeToJD(parsedResume, jd))
    .sort((a, b) => b.matchingScore - a.matchingScore);

  return {
    name: parsedResume.name,
    salary: matchingJobs.find(job => job.salary)?.salary || null,
    email: parsedResume.email,
    phone: parsedResume.phone,
    yearOfExperience: parsedResume.yearOfExperience,
    resumeSkills: parsedResume.resumeSkills,
    matchingJobs,
  };
}

module.exports = { matchResumeToJD, matchResumeToJDs };
