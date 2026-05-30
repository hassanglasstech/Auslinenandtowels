// sync-partials.js
// Reads src/partials/header.html + footer.html and embeds them as
// template strings in assets/partials.js (window.ALT_HEADER / ALT_FOOTER).
//
// Run: node scripts/sync-partials.js
// Auto-run on push via GitHub Actions (ci.yml).

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const headerSrc = fs.readFileSync(path.join(ROOT, 'src/partials/header.html'), 'utf8').trim();
const footerSrc = fs.readFileSync(path.join(ROOT, 'src/partials/footer.html'), 'utf8').trim();

let partials = fs.readFileSync(path.join(ROOT, 'assets/partials.js'), 'utf8');

// Replace the content of window.ALT_HEADER = function() { return "..."; };
partials = partials.replace(
  /window\.ALT_HEADER = function\(\) \{\n    return "[^"]*(?:\\.[^"]*)*";\n  \};/,
  `window.ALT_HEADER = function() {\n    return ${JSON.stringify(headerSrc)};\n  };`
);

// Replace the content of window.ALT_FOOTER = function() { return "..."; };
partials = partials.replace(
  /window\.ALT_FOOTER = function\(\) \{\n    return "[^"]*(?:\\.[^"]*)*";\n  \};/,
  `window.ALT_FOOTER = function() {\n    return ${JSON.stringify(footerSrc)};\n  };`
);

fs.writeFileSync(path.join(ROOT, 'assets/partials.js'), partials, 'utf8');
console.log('✓ partials.js synced from src/partials/');
