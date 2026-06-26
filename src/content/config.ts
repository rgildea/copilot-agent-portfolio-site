import { defineCollection, z } from "astro:content";

const portfolio = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    role: z.string(),
    image: z.string(),
    url: z.string(),
    client: z.string().optional(),
    description: z.string(),
    featured: z.boolean().default(false),
    order: z.number().default(10),
    audioTracks: z
      .array(
        z.object({
          title: z.string(),
          roughUrl: z.string().url(),
          finalUrl: z.string().url(),
          roughOffset: z.number().default(0),
          roughGain: z.number().finite().min(-60).max(12).default(0),
          finalGain: z.number().finite().min(-60).max(12).default(0),
        }),
      )
      .optional(),
  }),
});

const services = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    icon: z.string(),
    description: z.string(),
    order: z.number().default(10),
  }),
});

export const collections = { portfolio, services };
