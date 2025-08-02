# mostly true

A personal blog built with Astro, featuring stories from life by Virgil Eaton.

## About

This is the source code for [mostly true](https://www.mostlytrue.life), a personal blog that shares stories from life. The site is built with modern web technologies and focuses on accessibility, performance, and a clean reading experience.

## Features

- **Fast & Lightweight**: Built with Astro for optimal performance
- **Accessible**: WCAG 2.1 AA compliant with comprehensive accessibility features
- **Responsive**: Works beautifully on all devices
- **Clean Typography**: Optimized for reading with Arvo font
- **Tag System**: Stories are organized with tags for easy discovery
- **Guestbook**: Interactive guestbook for reader engagement
- **RSS Feed**: Subscribe to get notified of new stories
- **Search Engine Optimized**: Proper meta tags and structured data

## Tech Stack

- **Framework**: [Astro](https://astro.build)
- **Content**: Markdown/MDX files
- **Styling**: CSS with custom properties
- **Deployment**: Netlify
- **Forms**: Netlify Forms
- **Fonts**: Arvo (Google Fonts)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ninepence-mnml.git
cd ninepence-mnml
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and visit `http://localhost:4321`

### Building for Production

```bash
npm run build
```

The built site will be in the `dist/` directory.

## Project Structure

```
ninepence-mnml/
├── public/                 # Static assets
│   ├── assets/            # Images and media
│   ├── fonts/             # Custom fonts
│   └── og_default.jpg     # Open Graph default image
├── src/
│   ├── components/        # Reusable Astro components
│   ├── content/           # Content collections
│   │   └── stories/       # Blog posts
│   ├── layouts/           # Page layouts
│   ├── pages/             # Route pages
│   └── styles/            # Global CSS
├── astro.config.mjs       # Astro configuration
└── package.json
```

## Content Management

### Adding New Stories

1. Create a new folder in `src/content/stories/` with a slug name
2. Add an `index.md` or `index.mdx` file with frontmatter:

```markdown
---
title: "Your Story Title"
date: 2024-01-15
description: "A brief description of your story"
tags: ["travel", "adventure"]
---

Your story content here...
```

### Available Frontmatter Fields

- `title`: Story title
- `date`: Publication date
- `description`: Brief description for previews
- `tags`: Array of tags for categorization

## Accessibility Features

- **Skip Links**: Quick navigation for keyboard users
- **Focus Management**: Clear focus indicators
- **Screen Reader Support**: Proper ARIA labels and landmarks
- **Color Contrast**: WCAG AA compliant color ratios
- **Motion Reduction**: Respects user motion preferences
- **Form Validation**: Accessible form feedback
- **Semantic HTML**: Proper heading structure and landmarks

## Customization

### Colors

The site uses CSS custom properties for easy theming. Main colors are defined in `src/styles/global.css`:

```css
:root {
  --color-link: #0077cc;
  --color-link-hover: #b89c4c;
  --color-dark: #442625;
  --color-text: #442625;
  /* ... more colors */
}
```

### Typography

The site uses Arvo font family. Font sizes are responsive using CSS clamp:

```css
--s0: clamp(1rem, 1rem + 0vw, 1rem);
--s1: clamp(1.25rem, 1.19rem + 0.32vw, 1.41rem);
```

## Deployment

The site is configured for deployment on Netlify:

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly, especially accessibility
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- **Website**: [mostlytrue.life](https://www.mostlytrue.life)
- **Guestbook**: Leave a message on the [guestbook page](https://www.mostlytrue.life/guestbook)

---

_Built with ❤️ and Astro_

```sh
npm create astro@latest -- --template minimal
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/minimal)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/minimal)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/minimal/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
