const fs = require('fs');

const path = './src/components/ProjectCard.jsx';
let content = fs.readFileSync(path, 'utf8');

// The regex will look for <h3 className="..." className={`hover:text-accent transition-colors ${"..."}`}>
content = content.replace(/className="([^"]+)"\s+className={`hover:text-accent transition-colors \${"[^"]+"}`}/g, 'className={`hover:text-accent transition-colors $1`}');

fs.writeFileSync(path, content, 'utf8');
console.log('ProjectCard fixed!');
