# Astro Patterns & Gotchas

Common patterns and pitfalls when building with Astro + Tailwind + Cloudflare.

## Content Collections

### Setup
```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    author: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
  }),
});

export const collections = { posts };
```

### Querying Collections
```astro
---
import { getCollection } from 'astro:content';

// All published posts, sorted by date
const posts = await getCollection('posts', ({ data }) => !data.draft);
posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

// Featured only
const featured = await getCollection('posts', ({ data }) => data.featured && !data.draft);

// By tag
const tagged = await getCollection('posts', ({ data }) => data.tags.includes('analysis'));
---
```

### Dynamic Routes from Collections
```astro
---
// src/pages/blog/[slug].astro
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('posts');
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---
<Content />
```

## Image Optimization

### Using Astro's Image Component
```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.png';
---
<Image 
  src={heroImage} 
  alt="Description" 
  width={800}
  loading="lazy"
  decoding="async"
/>
```

### Remote Images (requires config)
```javascript
// astro.config.mjs
export default defineConfig({
  image: {
    domains: ['example.com'],
    remotePatterns: [{ protocol: 'https' }],
  },
});
```

### Responsive Images
```astro
<picture>
  <source srcset="/image.webp" type="image/webp" />
  <source srcset="/image.jpg" type="image/jpeg" />
  <img src="/image.jpg" alt="Description" loading="lazy" />
</picture>
```

## Common Gotchas

### 1. Hydration for Interactive Components
Astro components are static by default. For interactivity, use framework components with directives:

```astro
---
import Counter from '../components/Counter.jsx';
---
<!-- Static: no JS shipped -->
<Counter />

<!-- Interactive: hydrate on load -->
<Counter client:load />

<!-- Interactive: hydrate when visible -->
<Counter client:visible />

<!-- Interactive: hydrate on idle -->
<Counter client:idle />
```

### 2. CSS Scoping
Astro styles are scoped by default. For global styles:

```astro
<style is:global>
  /* Applies globally */
</style>

<style>
  /* Scoped to this component */
</style>
```

### 3. Environment Variables
```javascript
// Client-side (must be prefixed)
const apiUrl = import.meta.env.PUBLIC_API_URL;

// Server-side only
const secret = import.meta.env.API_SECRET;
```

### 4. Build vs Dev Differences
```astro
---
if (import.meta.env.DEV) {
  // Only in dev
}
if (import.meta.env.PROD) {
  // Only in prod build
}
---
```

### 5. Trailing Slashes
Configure consistently:
```javascript
// astro.config.mjs
export default defineConfig({
  trailingSlash: 'always', // or 'never' or 'ignore'
});
```

## SEO Patterns

### Base Head Component
```astro
---
// src/components/BaseHead.astro
interface Props {
  title: string;
  description: string;
  image?: string;
}
const { title, description, image = '/og-default.png' } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="canonical" href={canonicalURL} />
<title>{title}</title>
<meta name="description" content={description} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={new URL(image, Astro.site)} />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
```

### Sitemap
```javascript
// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com',
  integrations: [sitemap()],
});
```

### robots.txt
```
// public/robots.txt
User-agent: *
Allow: /
Sitemap: https://example.com/sitemap-index.xml
```

## Cloudflare Specifics

### Adapter for SSR
```javascript
// astro.config.mjs
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server', // or 'hybrid'
  adapter: cloudflare(),
});
```

### Static Export (default)
No adapter needed. Just build and deploy `dist/` folder.

### Headers and Redirects
```
// public/_headers
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff

/old-page
  Location: /new-page
  Status: 301
```

## Performance Checklist

- [ ] Images use Astro's `<Image>` component
- [ ] Below-fold images have `loading="lazy"`
- [ ] Fonts preloaded: `<link rel="preload" as="font">`
- [ ] Critical CSS inlined
- [ ] No unused CSS (Tailwind purges automatically)
- [ ] JS only shipped where needed (`client:*` directives)
- [ ] Third-party scripts use `async` or `defer`