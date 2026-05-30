import { defineConfig }                                      from 'vite';
import { resolve }                                           from 'path';
import { readdirSync, copyFileSync, mkdirSync, existsSync, readFileSync } from 'fs';

// ── Build-time HTML partials ──────────────────────────────────────────────────
// Replaces <!--@include src/partials/foo.html--> directives before Vite processes
// each page — header.html and footer.html are static files, not JS template strings.
function htmlIncludes() {
  return {
    name: 'html-includes',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(/<!--\s*@include\s+([^\s]+)\s*-->/g, (_, inc) => {
          const abs = resolve(__dirname, inc);
          return existsSync(abs) ? readFileSync(abs, 'utf-8') : `<!-- missing: ${inc} -->`;
        });
      },
    },
  };
}

// ── Multi-Page App: every HTML at root is an entry point ─────────────────────
// Excludes utility/google-verification files and the generated contrast preview.
const EXCLUDE = new Set(['google42266f806ff13753.html', '_contrast-preview.html']);
const entries = Object.fromEntries(
  readdirSync('.').filter(f => f.endsWith('.html') && !EXCLUDE.has(f))
                  .map(f => [f.replace('.html', ''), resolve(__dirname, f)])
);

// ── Post-build: copy server-side files into dist/ ────────────────────────────
// PHP, .htaccess, images, and the api/ directory are not processed by Vite
// (they're not imported by any HTML entry). This plugin copies them after build
// so dist/ is a complete, self-contained deployment folder.
function copyServerFiles() {
  return {
    name: 'copy-server-files',
    closeBundle() {
      const copy = (src, dst) => {
        if (!existsSync(src)) return;
        const dir = dst.substring(0, dst.lastIndexOf('/'));
        if (dir) mkdirSync(dir, { recursive: true });
        copyFileSync(src, dst);
      };

      // Root PHP + config files
      ['mail.php', 'backup.php', 'health.php', 'export-subscribers.php',
       'unsubscribe.php', '.htaccess', '.htpasswd', 'setup-db.sql',
       'google42266f806ff13753.html'].forEach(f => copy(f, `dist/${f}`));

      // api/ layer
      ['api/db.php', 'api/products.php', 'api/catalog-helpers.js'].forEach(f => copy(f, `dist/${f}`));

      // Plain (non-module) JS assets — Vite only processes <script type="module">;
      // these are loaded as classic scripts so they must be copied manually.
      ['products-data.js', 'partials.js', 'lead-capture.js',
       'onboarding.js', 'upgrades.js', 'wishlist.js']
        .forEach(f => copy(`assets/${f}`, `dist/assets/${f}`));

      // products-seed.json (needed for seed action)
      copy('assets/products-seed.json', 'dist/assets/products-seed.json');
    }
  };
}

// ── Config ────────────────────────────────────────────────────────────────────
export default defineConfig({
  root: '.',
  base: '/',
  plugins: [htmlIncludes(), copyServerFiles()],

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Preserve images, fonts, and other static assets as-is
    assetsInlineLimit: 0,
    rollupOptions: {
      input: entries,
      output: {
        // Predictable output names so .htaccess rewrite rules keep working
        entryFileNames:   'assets/js/[name]-[hash].js',
        chunkFileNames:   'assets/js/[name]-[hash].js',
        assetFileNames:   ({ name }) => {
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(name ?? '')) return 'images/[name]-[hash][extname]';
          if (/\.css$/i.test(name ?? ''))                            return 'assets/css/[name]-[hash][extname]';
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },

  // Dev server: proxies PHP requests to Hostinger in production; serves static locally
  server: {
    port: 7788,
    strictPort: true,
  },
});
