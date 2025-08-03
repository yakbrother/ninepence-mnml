# mostly true | virgil eaton

A personal blog built with Astro and Sanity CMS, featuring stories about busking around the world, dancing through the streets, life in a wheelchair, camping, wild animals, and more.

## Features

- **Content Management**: Sanity CMS for easy content editing
- **Static Site Generation**: Fast, SEO-friendly pages
- **Responsive Design**: Works on all devices
- **Accessibility**: WCAG compliant with proper focus management
- **RSS Feed**: Automatic feed generation for subscribers

## Development

### Prerequisites

- Node.js 18+ (see `.nvmrc`)
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with Sanity configuration:
   ```
   PUBLIC_SANITY_STUDIO_PROJECT_ID=your-project-id
   PUBLIC_SANITY_STUDIO_DATASET=production
   SANITY_TOKEN=your-api-token
   ```
4. Run development server: `npm run dev`

### Build

```bash
npm run build
```

**Note**: The build may show warnings about large chunks (>2MB). This is expected due to Sanity Studio components and doesn't affect functionality. The large chunks are only loaded when accessing the admin interface at `/admin`.

### Deployment

The site is configured for deployment on Netlify with:

- Server-side rendering for dynamic content
- Sanity Studio accessible at `/admin`
- Automatic redirects and environment variable handling

## Content Structure

- **Stories**: Individual blog posts with markdown content
- **Tags**: Categorized content for easy discovery
- **RSS Feed**: Automatic syndication at `/rss.xml`

## Technology Stack

- **Framework**: Astro 5.x
- **CMS**: Sanity 4.x
- **Styling**: Custom CSS with CSS custom properties
- **Deployment**: Netlify
- **Node.js**: 18+ (specified in `package.json` engines)
