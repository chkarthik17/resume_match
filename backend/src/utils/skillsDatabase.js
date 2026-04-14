/**
 * Comprehensive skills database for rule-based extraction.
 * Organized by category for better maintainability.
 */

const SKILLS_DB = {
  languages: [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'c', 'go', 'golang',
    'rust', 'kotlin', 'swift', 'scala', 'ruby', 'php', 'r', 'matlab', 'fortran',
    'perl', 'bash', 'shell', 'powershell', 'groovy', 'dart', 'lua', 'haskell',
    'elixir', 'clojure', 'f#', 'cobol', 'assembly', 'vba', 'hack',
  ],
  frontend: [
    'react', 'reactjs', 'react.js', 'angular', 'angularjs', 'vue', 'vuejs', 'vue.js',
    'svelte', 'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less',
    'bootstrap', 'tailwind', 'tailwindcss', 'jquery', 'next.js', 'nextjs',
    'nuxt', 'gatsby', 'webpack', 'vite', 'babel', 'redux', 'zustand',
    'graphql', 'rest', 'restful', 'ajax', 'typescript', 'ui/ux',
  ],
  backend: [
    'node.js', 'nodejs', 'express', 'expressjs', 'fastapi', 'django', 'flask',
    'spring', 'spring boot', 'springboot', 'asp.net', '.net', 'rails', 'ruby on rails',
    'laravel', 'symfony', 'nestjs', 'nest.js', 'fastify', 'gin', 'fiber',
    'grpc', 'graphql', 'rest api', 'microservices', 'kafka', 'rabbitmq',
    'activemq', 'celery', 'websocket', 'socket.io',
  ],
  databases: [
    'mysql', 'postgresql', 'postgres', 'sqlite', 'mongodb', 'redis', 'cassandra',
    'dynamodb', 'elasticsearch', 'elastic search', 'oracle', 'sql server',
    'microsoft sql server', 'mssql', 'mariadb', 'neo4j', 'influxdb', 'couchdb',
    'firestore', 'supabase', 'sql', 'nosql', 'no sql', 'db2', 'udb',
  ],
  cloud: [
    'aws', 'amazon web services', 'azure', 'microsoft azure', 'gcp',
    'google cloud', 'heroku', 'digitalocean', 'firebase', 'vercel',
    'netlify', 'cloudflare', 'linode',
  ],
  devops: [
    'docker', 'kubernetes', 'k8s', 'jenkins', 'gitlab ci', 'github actions',
    'ci/cd', 'cicd', 'terraform', 'ansible', 'chef', 'puppet', 'vagrant',
    'helm', 'prometheus', 'grafana', 'elk', 'kibana', 'logstash',
    'nginx', 'apache', 'linux', 'unix', 'devops', 'devSecOps',
  ],
  testing: [
    'jest', 'mocha', 'chai', 'junit', 'pytest', 'selenium', 'cypress',
    'playwright', 'postman', 'testng', 'rspec', 'unit testing', 'test-driven development', 'test driven development',
    'integration testing', 'tdd', 'bdd', 'e2e', 'agile', 'scrum', 'kanban',
  ],
  ml_ai: [
    'machine learning', 'ml', 'deep learning', 'artificial intelligence', 'ai',
    'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn', 'pandas',
    'numpy', 'opencv', 'nlp', 'computer vision', 'llm', 'transformers',
    'huggingface', 'cuda', 'gpu', 'neural network',
  ],
  tools: [
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack',
    'linux', 'unix', 'vim', 'vscode', 'intellij', 'eclipse', 'xcode',
    'figma', 'postman', 'swagger', 'openapi', 'sonarqube', 'splunk',
    'datadog', 'new relic', 'mpi', 'openmp', 'fpga', 'rtos', 'version control',
  ],
  architecture: [
    'microservices', 'monolith', 'serverless', 'event-driven', 'soa',
    'mvc', 'mvvm', 'solid', 'oop', 'functional programming', 'api design',
    'system design', 'distributed systems', 'high performance computing', 'hpc',
    'cloud native', 'containerization', 'full stack', 'full-stack',
    'software development lifecycle', 'software development life cycle',
    'parallel programming', 'linear algebra', 'numerical algorithms',
    'numerical solutions', 'scientific computing', 'scientific simulation',
    'computational methods', 'modeling and simulation', 'electromagnetic wave theory',
  ],
  // Common abbreviations and alternate spellings found in real JDs
  aliases: [
    'ai/ml', 'aiml', 'alml', 'ml/ai',
    'sdlc', 'tdd', 'bdd', 'ci/cd', 'cicd',
    'nosql', 'no-sql',
    'grpc', 'graphql',
    'erp', 'cms', 'saas',
    'csharp', 'dotnet',
  ],
};

// Flat deduplicated list for quick lookup
const ALL_SKILLS = [...new Set(Object.values(SKILLS_DB).flat())];

// Skills that need exact / boundary matching (avoid partial hits)
const EXACT_MATCH_SKILLS = new Set([
  'c', 'r', 'go', 'ml', 'ai', 'sql', 'aws', 'gcp', 'elk',
]);

module.exports = { SKILLS_DB, ALL_SKILLS, EXACT_MATCH_SKILLS };
