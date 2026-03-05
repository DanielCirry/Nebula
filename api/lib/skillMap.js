// Mapping of known technologies/tools to skill categories.
// Keys are lowercase for case-insensitive matching.
// Order matters: first match wins, so more specific entries come first.

const SKILL_CATEGORIES = [
  {
    category: 'Languages',
    keywords: [
      'c#', 'csharp', 'go', 'golang', 'python',
      'java', 'sql', 'rust', 'php', 'ruby', 'kotlin', 'swift', 'dart',
      'c++', 'cpp', 'c', 'bash', 'powershell', 'r', 'scala', 'elixir',
      'haskell', 'lua', 'perl', 'objective-c', 'f#', 'fsharp', 'clojure',
      'groovy', 'matlab', 'vb.net', 'visual basic', 'assembly', 'zig',
    ],
  },
  {
    category: 'Frontend',
    keywords: [
      'html', 'css', 'scss', 'sass', 'less',
      'javascript', 'typescript',
      'react', 'next.js', 'nextjs', 'vue', 'vuejs', 'vue.js', 'angular',
      'svelte', 'sveltekit', 'tailwind', 'tailwind css', 'framer motion',
      'bootstrap', 'material ui', 'mui', 'chakra ui', 'ant design',
      'jquery', 'blazor', 'webpack', 'vite', 'remix', 'gatsby', 'nuxt',
      'nuxtjs', 'nuxt.js', 'storybook', 'redux', 'zustand', 'mobx',
      'react native', 'expo', 'flutter', 'ionic', 'electron',
      'styled-components', 'emotion', 'pinia', 'vuex', 'react router',
      'tanstack', 'react query', 'swr', 'astro', 'qwik', 'solid',
      'solidjs', 'htmx', 'alpine.js', 'alpinejs', 'lit', 'web components',
      'three.js', 'threejs', 'd3', 'd3.js', 'chart.js', 'recharts',
      'cypress', 'playwright', 'jest', 'vitest', 'testing library',
      'tiptap', 'prosemirror', 'quill', 'lexical',
    ],
  },
  {
    category: 'Backend',
    keywords: [
      '.net', 'dotnet', 'asp.net', 'asp.net core', 'node.js', 'nodejs',
      'express', 'expressjs', 'express.js', 'azure functions',
      'spring boot', 'spring', 'django', 'flask', 'fastapi', 'nestjs',
      'nest.js', 'grpc', 'graphql', 'rest', 'restful', 'hapi',
      'koa', 'fastify', 'gin', 'echo', 'fiber', 'actix', 'rocket',
      'rails', 'ruby on rails', 'laravel', 'symfony', 'phoenix',
      'ktor', 'micronaut', 'quarkus', 'vertx', 'vert.x',
      'signalr', 'websocket', 'websockets', 'socket.io',
      'swagger', 'openapi', 'oauth', 'jwt', 'auth0',
      'entity framework', 'ef core', 'dapper', 'prisma',
      'sequelize', 'typeorm', 'drizzle', 'knex', 'mongoose',
      'hibernate', 'sqlalchemy', 'alembic',
      'hangfire', 'quartz', 'mediatr', 'automapper',
      'hocuspocus', 'collab',
    ],
  },
  {
    category: 'Data',
    keywords: [
      'sql server', 'mssql', 'postgresql', 'postgres', 'mongodb', 'mongo',
      'cosmosdb', 'cosmos db', 'elasticsearch', 'elastic', 'redis',
      'mysql', 'mariadb', 'dynamodb', 'dynamo', 'cassandra', 'couchdb',
      'neo4j', 'firebase', 'firestore', 'supabase', 'sqlite',
      'kafka', 'rabbitmq', 'service bus', 'azure service bus',
      'event hub', 'event grid', 'sns', 'sqs', 'kinesis',
      'apache spark', 'spark', 'hadoop', 'airflow', 'dbt',
      'snowflake', 'bigquery', 'redshift', 'databricks',
      'etl', 'data warehouse', 'data lake', 'data pipeline',
      'power bi', 'tableau', 'grafana', 'kibana',
      'memcached', 'couchbase',
    ],
  },
  {
    category: 'Cloud & DevOps',
    keywords: [
      'azure', 'aws', 'gcp', 'google cloud', 'docker', 'kubernetes',
      'k8s', 'terraform', 'bicep', 'bicep iac', 'iac',
      'github actions', 'gitlab ci', 'gitlab', 'jenkins', 'ansible',
      'pulumi', 'cloudformation', 'arm templates',
      'ci/cd', 'cicd', 'devops', 'sre',
      'nginx', 'apache', 'caddy', 'traefik',
      'helm', 'istio', 'envoy', 'consul', 'vault',
      'prometheus', 'datadog', 'new relic', 'splunk',
      'azure devops', 'ado', 'octopus deploy',
      'vercel', 'netlify', 'heroku', 'digitalocean',
      'cloudflare', 'cdn', 'load balancer',
      'linux', 'ubuntu', 'centos', 'windows server',
      'vagrant', 'packer', 'nomad',
      'app service', 'aks', 'ecs', 'eks', 'fargate', 'lambda',
      'serverless', 'microservices', 'monorepo',
      'git', 'github', 'bitbucket',
      'sonarqube', 'snyk', 'owasp',
    ],
  },
  {
    category: 'AI/ML',
    keywords: [
      'claude', 'claude api', 'openai', 'gpt', 'chatgpt', 'llm',
      'prompt engineering', 'ai-assisted', 'automation tooling',
      'tensorflow', 'pytorch', 'hugging face', 'huggingface',
      'leonardo ai', 'stable diffusion', 'midjourney', 'dall-e', 'dalle',
      'langchain', 'langsmith', 'llamaindex', 'llama index',
      'machine learning', 'deep learning', 'neural network',
      'nlp', 'natural language processing', 'computer vision',
      'rag', 'retrieval augmented', 'vector database', 'pinecone',
      'weaviate', 'chroma', 'embeddings', 'fine-tuning', 'fine tuning',
      'transformers', 'bert', 'gpt-4', 'gpt-3', 'gemini',
      'copilot', 'ai', 'ml', 'artificial intelligence',
      'scikit-learn', 'sklearn', 'pandas', 'numpy', 'scipy',
      'keras', 'xgboost', 'lightgbm', 'catboost',
      'mlflow', 'mlops', 'model serving', 'inference',
      'anthropic', 'anthropic api', 'bedrock', 'sagemaker',
      'vertex ai', 'azure openai', 'azure ai',
      'nvidia', 'cuda', 'gpu',
    ],
  },
]

/**
 * Classify a flat list of skill strings into categories.
 * Uses "longest keyword wins" strategy to pick the most specific match.
 * @param {string[]} flatItems - Array of skill name strings
 * @returns {{ category: string, items: string[] }[]} - Categorized skills
 */
export function classifySkills(flatItems) {
  const buckets = {}
  for (const cat of SKILL_CATEGORIES) {
    buckets[cat.category] = []
  }
  const uncategorized = []

  for (const skill of flatItems) {
    const normalized = skill.toLowerCase().trim()
    if (!normalized) continue

    let bestMatch = null
    let bestKeywordLength = 0

    for (const cat of SKILL_CATEGORIES) {
      for (const kw of cat.keywords) {
        let matches = false

        if (normalized === kw) {
          // Exact match — immediately wins
          bestMatch = cat.category
          bestKeywordLength = Infinity
          break
        }

        // Skill contains the keyword (e.g. ".NET 8" contains ".net")
        if (normalized.includes(kw) && kw.length > 1) matches = true
        // Keyword contains the skill (e.g. "tailwind css" contains "tailwind")
        if (kw.includes(normalized) && normalized.length > 3) matches = true

        if (matches && kw.length > bestKeywordLength) {
          bestMatch = cat.category
          bestKeywordLength = kw.length
        }
      }
      if (bestKeywordLength === Infinity) break
    }

    if (bestMatch) {
      buckets[bestMatch].push(skill)
    } else {
      uncategorized.push(skill)
    }
  }

  // Deduplicate items within each category (case-insensitive)
  const result = SKILL_CATEGORIES
    .filter((cat) => buckets[cat.category].length > 0)
    .map((cat) => {
      const seen = new Set()
      const unique = buckets[cat.category].filter((item) => {
        const key = item.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      return { category: cat.category, items: unique }
    })

  if (uncategorized.length > 0) {
    result.push({ category: 'Other', items: uncategorized })
  }

  // Merge categories with only 1 item into the nearest related category
  const MIN_ITEMS = 2
  const MERGE_TARGETS = {
    'Languages': 'Backend',
    'Other': 'Cloud & DevOps',
    'AI/ML': 'Backend',
  }
  const toMerge = result.filter((cat) => cat.items.length < MIN_ITEMS)
  const toKeep = result.filter((cat) => cat.items.length >= MIN_ITEMS)
  for (const small of toMerge) {
    const targetName = MERGE_TARGETS[small.category]
    const target = toKeep.find((c) => c.category === targetName) || toKeep[0]
    if (target) {
      target.items.push(...small.items)
    } else {
      toKeep.push(small)
    }
  }

  return toKeep.map((cat) => ({
    ...cat,
    items: cat.items.map(titleCaseSkill),
  }))
}

// Capitalize skill names properly.
// Preserves already-cased items (e.g. "ASP.NET Core", "CI/CD").
// Title-cases lowercase items (e.g. "automation tooling" → "Automation Tooling").
function titleCaseSkill(skill) {
  // If it already has mixed case or uppercase, keep it as-is
  if (skill !== skill.toLowerCase()) return skill
  // Title-case each word
  return skill.replace(/\b[a-z]/g, (c) => c.toUpperCase())
}

export { SKILL_CATEGORIES }
