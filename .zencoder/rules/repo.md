---
description: Repository Information Overview
alwaysApply: true
---

# Mostly True Blog Information

## Summary

A personal blog built with Astro, featuring stories from life. The site focuses on accessibility, performance, and a clean reading experience. It's designed to be deployed on Netlify and uses Markdown/MDX for content management.

## Structure

- **public/**: Static assets including images, fonts, and media files
- **src/**: Source code for the website
  - **components/**: Reusable Astro components (Header, Footer, etc.)
  - **content/**: Content collections, primarily stories
  - **layouts/**: Page layout templates
  - **pages/**: Route pages that define the site structure
  - **styles/**: Global CSS styling

## Language & Runtime

**Language**: TypeScript/JavaScript
**Version**: Node.js 18+
**Build System**: Astro
**Package Manager**: npm

## Dependencies

**Main Dependencies**:

- astro: ^5.13.5 (Core framework)
- @astrojs/mdx: ^4.3.5 (MDX support for content)

**Development Dependencies**:

- @types/node: ^20.0.0 (TypeScript definitions)

## Build & Installation

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Content Management

**Content Format**: Markdown/MDX
**Content Location**: src/content/stories/
**Structure**: Each story is in its own folder with an index.md or index.mdx file
**Frontmatter Fields**:

- title: Story title
- date: Publication date
- description: Brief description
- tags: Array of categorization tags

## Styling

**Approach**: Custom CSS with variables
**Typography**: Arvo font family (loaded from public/fonts/)
**Responsive Design**: Uses CSS clamp for fluid typography
**Color Scheme**: Defined via CSS custom properties in src/styles/global.css

## Deployment

**Platform**: Netlify
**Build Command**: npm run build
**Publish Directory**: dist
**Forms**: Uses Netlify Forms for the guestbook functionality

## Accessibility

**Standards**: WCAG 2.1 AA compliant
**Features**: Skip links, proper focus management, semantic HTML, ARIA labels, color contrast compliance, and motion reduction support
