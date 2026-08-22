const fs = require('fs');

const path = './src/pages/HomePage.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Imports
if (!content.includes("import FAQ from '../components/FAQ'")) {
  content = content.replace(
    "import Welcome from '../components/Welcome';",
    "import Welcome from '../components/Welcome';\nimport FAQ from '../components/FAQ';\nimport { Helmet } from 'react-helmet-async';"
  );
}

// 2. Remove About, Skills, Timeline from below Hero
content = content.replace(
  /<Hero \/>\s*<About \/>\s*<Skills \/>\s*<Timeline \/>/,
  `<Helmet>
        <script type="application/ld+json">
          {\`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Arun Pandian | Data Analyst Portfolio",
              "url": "https://arunpandian.online/"
            }
          \`}
        </script>
        <script type="application/ld+json">
          {\`
            {
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Arun Pandian",
              "jobTitle": "Data Analyst",
              "url": "https://arunpandian.online/",
              "sameAs": [
                "https://github.com/shadow-byte-warrior",
                "https://linkedin.com/in/arunpandiansh2030"
              ]
            }
          \`}
        </script>
      </Helmet>
      
      <Hero />`
);

// 3. Add them before Blog section
content = content.replace(
  /\{\/\* Blog Section \*\/\}/,
  `<About />
      <Skills />
      <Timeline />
      
      <FAQ />

      {/* Blog Section */}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('HomePage updated successfully!');
