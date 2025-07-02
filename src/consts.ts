import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
  TITLE: "Mostly True",
  DESCRIPTION: "A selection of stories I like to tell around a campfire",
  EMAIL: "virgil@mostlytrue.life",
  NUM_POSTS_ON_HOMEPAGE: 7,
  WEBSITE_URL: "https://mostlytrue.life",
};

export const HOME: Metadata = {
  TITLE: "Mostly True",
  DESCRIPTION: "A selection of stories I like to tell around a campfire.",
};

export const ABOUT: Metadata = {
  TITLE: "About",
  DESCRIPTION: "Who is Virgil Eaton, anyway?",
};

export const NOW: Metadata = {
  TITLE: "Now",
  DESCRIPTION: "What's new?",
};

export const STORIES: Metadata = {
  TITLE: "Stories",
  DESCRIPTION:
    "A collection of Mostly True life stories, as heard around decades of campfires and barstools.",
};

export const SOCIALS: Socials = [
  {
    NAME: "Bluesky",
    HREF: "https://bsky.app/profile/@yakbrother",
  },
  {
    NAME: "GitHub",
    HREF: "https://github.com/yakbrother",
  },
  {
    NAME: "Work Portfolio",
    HREF: "https://timeaton.dev",
  },
];
