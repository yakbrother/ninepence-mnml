import { createClient } from "@sanity/client";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { loadEnv } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const {
  PUBLIC_SANITY_STUDIO_PROJECT_ID,
  PUBLIC_SANITY_STUDIO_DATASET,
  SANITY_TOKEN,
} = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");

// Sanity client configuration
const client = createClient({
  projectId: PUBLIC_SANITY_STUDIO_PROJECT_ID,
  dataset: PUBLIC_SANITY_STUDIO_DATASET,
  token: SANITY_TOKEN, // You'll need to create a token in Sanity Studio
  apiVersion: "2024-01-01",
  useCdn: false,
});

// Function to convert markdown frontmatter to Sanity document
function convertToSanityDocument(filePath, content) {
  const { data, content: markdownContent } = matter(content);

  // Create slug from filename
  const fileName = path.basename(path.dirname(filePath));

  return {
    _type: "story",
    title: data.title,
    slug: {
      _type: "slug",
      current: fileName,
    },
    description: data.description,
    date: data.date,
    draft: data.draft !== undefined ? data.draft : true,
    tags: data.tags || [],
    featured: data.featured || false,
    content: markdownContent.trim(),
  };
}

// Function to read all markdown files
async function migrateStories() {
  const storiesDir = path.join(__dirname, "src/content/stories");
  const stories = [];

  try {
    const storyFolders = fs.readdirSync(storiesDir);

    for (const folder of storyFolders) {
      const folderPath = path.join(storiesDir, folder);
      const stat = fs.statSync(folderPath);

      if (stat.isDirectory()) {
        const indexPath = path.join(folderPath, "index.md");
        const indexMdxPath = path.join(folderPath, "index.mdx");

        let filePath;
        if (fs.existsSync(indexMdxPath)) {
          filePath = indexMdxPath;
        } else if (fs.existsSync(indexPath)) {
          filePath = indexPath;
        } else {
          console.log(`No index file found in ${folder}`);
          continue;
        }

        const content = fs.readFileSync(filePath, "utf8");
        const sanityDoc = convertToSanityDocument(filePath, content);
        stories.push(sanityDoc);

        console.log(`Processed: ${sanityDoc.title}`);
      }
    }

    console.log(`\nFound ${stories.length} stories to migrate`);

    // Create documents in Sanity
    for (const story of stories) {
      try {
        const result = await client.create(story);
        console.log(`✅ Created: ${story.title} (ID: ${result._id})`);
      } catch (error) {
        console.error(`❌ Failed to create ${story.title}:`, error.message);
      }
    }

    console.log("\nMigration complete!");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// Run migration
migrateStories();
