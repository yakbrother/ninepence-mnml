// ./sanity.config.ts
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

export default defineConfig({
  title: "Mostly True - Content Studio",
  projectId: import.meta.env.PUBLIC_SANITY_STUDIO_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_STUDIO_DATASET,
  plugins: [structureTool(), visionTool()],
  schema: {
    types: [
      {
        type: "document",
        name: "post",
        title: "Post",
        fields: [
          {
            name: "title",
            title: "Title",
            type: "string",
          },
          {
            name: "slug",
            title: "Slug",
            type: "slug",
            options: {
              source: "title",
              maxLength: 96,
            },
          },
          {
            name: "description",
            title: "Description",
            type: "text",
          },
          {
            name: "date",
            title: "Date",
            type: "datetime",
          },
          {
            name: "draft",
            title: "Draft",
            type: "boolean",
            initialValue: true,
          },
          {
            name: "tags",
            title: "Tags",
            type: "array",
            of: [{ type: "string" }],
          },
        ],
      },
    ],
  },
}); 