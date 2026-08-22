const fs = require('fs');

const path = './src/components/ProjectCard.jsx';
let content = fs.readFileSync(path, 'utf8');

// Import Link
if (!content.includes('import { Link } from')) {
  content = content.replace(/import React.*?from 'react';/, "import React, { useRef } from 'react';\nimport { Link } from 'react-router-dom';");
}

// Replace caseStudyLink with `/project/${project.id}` everywhere
content = content.replace(/caseStudyLink \|\| githubLink/g, '`/project/${project.id}`');
content = content.replace(/href=\{caseStudyLink\}/g, 'href={`/project/${project.id}`}');
content = content.replace(/caseStudyLink &&/g, 'project.id &&');

// Actually, since we are using React Router, we should replace <a href={`/project/...`}> with <Link to={`/project/...`}>
content = content.replace(/<a href=\{`\/project\/\$\{project.id\}`\} (.*?)>(.*?)<\/a>/g, '<Link to={`/project/${project.id}`} $1>$2</Link>');

// We also need to add <Link> to the Title
content = content.replace(/<h3(.*?)>(.*?)<\/h3>/g, (match, p1, p2) => {
  return `<Link to={\`/project/\${project.id}\`}><h3${p1} className={\`hover:text-accent transition-colors \${${p1.match(/className="(.*?)"/)?.[1] ? `"${p1.match(/className="(.*?)"/)[1]}"` : '""'}}\`}>${p2}</h3></Link>`;
});

fs.writeFileSync(path, content, 'utf8');
console.log('ProjectCard updated with React Router Links');
