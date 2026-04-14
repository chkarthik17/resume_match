const { ALL_SKILLS } = require('./skillsDatabase');

/**
 * Canonical skill name map: alias → canonical
 * Ensures we return clean, consistent skill names.
 */
const ALIAS_MAP = {
  'reactjs': 'React',
  'react.js': 'React',
  'react': 'React',
  'angular': 'Angular',
  'angularjs': 'Angular',
  'vue': 'Vue.js',
  'vuejs': 'Vue.js',
  'vue.js': 'Vue.js',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'next.js': 'Next.js',
  'nextjs': 'Next.js',
  'expressjs': 'Express',
  'express': 'Express',
  'springboot': 'Spring Boot',
  'spring boot': 'Spring Boot',
  'spring': 'Spring',
  'postgresql': 'PostgreSQL',
  'postgres': 'PostgreSQL',
  'mongodb': 'MongoDB',
  'mysql': 'MySQL',
  'redis': 'Redis',
  'elasticsearch': 'Elasticsearch',
  'elastic search': 'Elasticsearch',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'docker': 'Docker',
  'aws': 'AWS',
  'amazon web services': 'AWS',
  'gcp': 'GCP',
  'google cloud': 'GCP',
  'azure': 'Azure',
  'microsoft azure': 'Azure',
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'python': 'Python',
  'java': 'Java',
  'c++': 'C++',
  'c#': 'C#',
  'golang': 'Go',
  'go': 'Go',
  'rust': 'Rust',
  'kotlin': 'Kotlin',
  'swift': 'Swift',
  'scala': 'Scala',
  'ruby': 'Ruby',
  'php': 'PHP',
  'c': 'C',
  'r': 'R',
  'bash': 'Bash',
  'shell': 'Shell Scripting',
  'linux': 'Linux',
  'unix': 'Unix',
  'git': 'Git',
  'github': 'GitHub',
  'github actions': 'GitHub Actions',
  'gitlab': 'GitLab',
  'version control': 'Git',
  'jenkins': 'Jenkins',
  'kafka': 'Kafka',
  'rabbitmq': 'RabbitMQ',
  'grpc': 'gRPC',
  'graphql': 'GraphQL',
  'rest api': 'REST API',
  'rest': 'REST API',
  'restful': 'REST API',
  'microservices': 'Microservices',
  'ci/cd': 'CI/CD',
  'cicd': 'CI/CD',
  'devops': 'DevOps',
  'devsecops': 'DevSecOps',
  'terraform': 'Terraform',
  'ansible': 'Ansible',
  'pytest': 'pytest',
  'junit': 'JUnit',
  'jest': 'Jest',
  'selenium': 'Selenium',
  'machine learning': 'Machine Learning',
  'ml': 'Machine Learning',
  'deep learning': 'Deep Learning',
  'artificial intelligence': 'AI',
  'ai': 'AI',
  'tensorflow': 'TensorFlow',
  'pytorch': 'PyTorch',
  'pandas': 'Pandas',
  'numpy': 'NumPy',
  'sql': 'SQL',
  'nosql': 'NoSQL',
  'agile': 'Agile',
  'scrum': 'Scrum',
  'hpc': 'HPC',
  'high performance computing': 'HPC',
  'mpi': 'MPI',
  'openmp': 'OpenMP',
  'fortran': 'Fortran',
  'html': 'HTML',
  'html5': 'HTML',
  'css': 'CSS',
  'css3': 'CSS',
  'sass': 'Sass',
  'tailwind': 'TailwindCSS',
  'tailwindcss': 'TailwindCSS',
  'bootstrap': 'Bootstrap',
  'jquery': 'jQuery',
  'django': 'Django',
  'flask': 'Flask',
  'fastapi': 'FastAPI',
  'rails': 'Ruby on Rails',
  'ruby on rails': 'Ruby on Rails',
  'asp.net': 'ASP.NET',
  '.net': '.NET',
  'nestjs': 'NestJS',
  'nest.js': 'NestJS',
  'swagger': 'Swagger',
  'openapi': 'OpenAPI',
  'figma': 'Figma',
  'jira': 'JIRA',
  'postman': 'Postman',
  'sqlite': 'SQLite',
  'cassandra': 'Cassandra',
  'dynamodb': 'DynamoDB',
  'neo4j': 'Neo4j',
  'oracle': 'Oracle DB',
  'sql server': 'SQL Server',
  'microsoft sql server': 'SQL Server',
  'mssql': 'SQL Server',
  'db2': 'DB2',
  'helm': 'Helm',
  'prometheus': 'Prometheus',
  'grafana': 'Grafana',
  'kibana': 'Kibana',
  'logstash': 'Logstash',
  'nginx': 'Nginx',
  'firebase': 'Firebase',
  'tdd': 'TDD',
  'test-driven development': 'TDD',
  'test driven development': 'TDD',
  'bdd': 'BDD',
  'unit testing': 'Unit Testing',
  'system design': 'System Design',
  'oop': 'OOP',
  'solid': 'SOLID',
  'fpga': 'FPGA',
  'rtos': 'RTOS',
  'cuda': 'CUDA',
  'pytorch': 'PyTorch',
  'opencv': 'OpenCV',
  'kotlin': 'Kotlin',
  'ai/ml': 'AI/ML',
  'aiml': 'AI/ML',
  'alml': 'AI/ML',
  'ml/ai': 'AI/ML',
  'full stack': 'Full Stack',
  'full-stack': 'Full Stack',
  'nosql': 'NoSQL',
  'no-sql': 'NoSQL',
  'no sql': 'NoSQL',
  'udb': 'UDB',
  'db2': 'DB2',
  'sdlc': 'SDLC',
  'software development lifecycle': 'SDLC',
  'software development life cycle': 'SDLC',
  'parallel programming': 'Parallel Programming',
  'linear algebra': 'Linear Algebra',
  'numerical algorithms': 'Numerical Algorithms',
  'numerical solutions': 'Numerical Methods',
  'scientific computing': 'Scientific Computing',
  'scientific simulation': 'Scientific Simulation',
  'computational methods': 'Computational Methods',
  'modeling and simulation': 'Modeling and Simulation',
  'electromagnetic wave theory': 'Electromagnetic Wave Theory',
  'grpc': 'gRPC',
  'graphql': 'GraphQL',
  'csharp': 'C#',
  'dotnet': '.NET',
  'saas': 'SaaS',
    'chef': 'Chef',
  'ui/ux': 'UI/UX',
};

// Skills that may appear immediately followed by an uppercase letter in mashed JD text
// e.g. "Spring bootShould" — we still want to catch "spring boot"
const ALLOW_UPPERCASE_AFTER = new Set(['spring boot', 'node.js', 'react', 'angular', 'python', 'java', 'docker', 'kubernetes', 'udb']);

/**
 * Extract skills from text using rule-based matching.
 * Handles multi-word skills (longest match first), canonical aliases, and
 * boundary checks. Also tolerates mashed-together JD text (e.g. "Spring bootShould").
 *
 * @param {string} text - Raw text to scan.
 * @returns {string[]} Deduplicated canonical skill names found.
 */
function extractSkills(text) {
  const lower = text.toLowerCase();
  const foundCanonical = new Set();

  // Sort by length descending so "spring boot" matches before "spring"
  const sortedSkills = ALL_SKILLS.slice().sort((a, b) => b.length - a.length);

  for (const skill of sortedSkills) {
    const skillKey = skill.toLowerCase();
    let idx = lower.indexOf(skillKey);
    while (idx !== -1) {
      const before = lower[idx - 1] || ' ';
      const afterChar = lower[idx + skillKey.length] || ' ';
      // Original char at that position in the raw text (to detect uppercase = mashed)
      const afterRaw = text[idx + skillKey.length] || ' ';

      const isBoundedBefore = /[\s,()\[\]\/\-+#.]/.test(before) || idx === 0;

      // After boundary: space/punct OR uppercase letter (mashed JD text like "bootShould")
      const isUpperAfter = afterRaw >= 'A' && afterRaw <= 'Z';
      const isBoundedAfter =
        /[\s,()\[\]\/\-+#.]/.test(afterChar) ||
        idx + skillKey.length === lower.length ||
        (isUpperAfter && ALLOW_UPPERCASE_AFTER.has(skillKey));

      if (isBoundedBefore && isBoundedAfter && isValidSkillOccurrence(text, idx, skillKey)) {
        const canonical = ALIAS_MAP[skillKey] || capitalize(skillKey);
        foundCanonical.add(canonical);
        break;
      }
      idx = lower.indexOf(skillKey, idx + 1);
    }
  }

  if (foundCanonical.has('AI/ML')) {
    foundCanonical.delete('AI');
    foundCanonical.delete('Machine Learning');
  }

  return [...foundCanonical].sort();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function isValidSkillOccurrence(text, idx, skillKey) {
  if (skillKey === 'solid') {
    const original = text.slice(idx, idx + skillKey.length);
    const after = text.slice(idx + skillKey.length, idx + skillKey.length + 20).toLowerCase();
    return original === 'SOLID' || /^\s+principles?\b/.test(after);
  }

  return true;
}

module.exports = { extractSkills, ALIAS_MAP };
