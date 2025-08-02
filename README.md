# Sanity Migrate Markdown

A Node.js package to migrate markdown files with frontmatter to Sanity CMS. Supports both directory-based and flat file structures.

## Features

- ✅ Migrate markdown files with frontmatter to Sanity CMS
- ✅ Support for both `.md` and `.mdx` files
- ✅ Directory-based structure (e.g., `content/story/index.md`)
- ✅ Flat file structure (e.g., `content/story.md`)
- ✅ Custom field mapping
- ✅ Dry run mode for previewing changes
- ✅ Environment variable support
- ✅ CLI interface
- ✅ Programmatic API

## Installation

```bash
npm install sanity-migrate-markdown
```

## Usage

### CLI

```bash
# Basic usage
npx sanity-migrate-markdown \
  --project-id "your-project-id" \
  --dataset "production" \
  --token "your-api-token" \
  --content-dir "./content"

# With custom document type
npx sanity-migrate-markdown \
  --project-id "your-project-id" \
  --dataset "production" \
  --token "your-api-token" \
  --content-dir "./content" \
  --document-type "post"

# Dry run to preview changes
npx sanity-migrate-markdown \
  --project-id "your-project-id" \
  --dataset "production" \
  --token "your-api-token" \
  --content-dir "./content" \
  --dry-run
```

### Programmatic API

```javascript
import { migrateMarkdownToSanity } from 'sanity-migrate-markdown';

await migrateMarkdownToSanity({
  projectId: 'your-project-id',
  dataset: 'production',
  token: 'your-api-token',
  contentDir: './content',
  documentType: 'story',
  slugField: 'title',
  fieldMapping: {
    'customField': 'frontmatterField'
  },
  dryRun: false
});
```

## Configuration

### Environment Variables

You can set these environment variables instead of passing them as arguments:

- `PUBLIC_SANITY_STUDIO_PROJECT_ID` - Sanity project ID
- `PUBLIC_SANITY_STUDIO_DATASET` - Sanity dataset name
- `SANITY_TOKEN` - Sanity API token

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `projectId` | string | - | Sanity project ID |
| `dataset` | string | - | Sanity dataset name |
| `token` | string | - | Sanity API token |
| `contentDir` | string | - | Directory containing markdown files |
| `documentType` | string | `"story"` | Sanity document type |
| `slugField` | string | `"title"` | Field to use for slug generation |
| `fieldMapping` | object | `{}` | Custom field mapping |
| `dryRun` | boolean | `false` | Preview changes without creating documents |

## File Structure Support

### Directory-based Structure

```
content/
├── story-1/
│   └── index.md
├── story-2/
│   └── index.mdx
└── story-3/
    └── index.md
```

### Flat File Structure

```
content/
├── story-1.md
├── story-2.mdx
└── story-3.md
```

## Markdown Frontmatter

The package supports common frontmatter fields:

```yaml
---
title: "My Story"
description: "A brief description"
date: "2024-01-01"
draft: false
tags: ["tag1", "tag2"]
featured: true
---
```

## Custom Field Mapping

You can map custom frontmatter fields to Sanity fields:

```javascript
await migrateMarkdownToSanity({
  // ... other options
  fieldMapping: {
    'author': 'authorName',
    'category': 'postCategory',
    'seoTitle': 'metaTitle'
  }
});
```

## Sanity Schema

Make sure your Sanity schema includes the necessary fields. Here's an example:

```javascript
// sanity.config.ts
export default defineConfig({
  // ... other config
  schema: {
    types: [
      {
        type: "document",
        name: "story",
        title: "Story",
        fields: [
          { name: "title", title: "Title", type: "string" },
          { name: "slug", title: "Slug", type: "slug", options: { source: "title" } },
          { name: "description", title: "Description", type: "text" },
          { name: "date", title: "Date", type: "datetime" },
          { name: "draft", title: "Draft", type: "boolean", initialValue: true },
          { name: "tags", title: "Tags", type: "array", of: [{ type: "string" }] },
          { name: "featured", title: "Featured", type: "boolean", initialValue: false },
          { name: "content", title: "Content", type: "text", rows: 20 },
        ],
      },
    ],
  },
});
```

## API Token

You'll need to create a Sanity API token with write permissions:

1. Go to [manage.sanity.io](https://manage.sanity.io)
2. Select your project
3. Go to API section
4. Create a new token with "Editor" permissions

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
