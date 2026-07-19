import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sergei-doroshenko.github.io',
  integrations: [sitemap()],
  // Old Jekyll permalink (minima default: /:categories/:y/:m/:d/:title.html)
  redirects: {
    '/tools/aws/bash/2025/06/08/c-sync-minimalist-aws-s3-backup-solution.html':
      '/blog/c-sync-minimalist-aws-s3-backup-solution/',
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
    },
  },
});
