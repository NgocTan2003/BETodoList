import { z } from "zod";

const createNoteSchema = z.object({
    title: z.string().min(6, { message: "Title must be at least 6 characters long" }).max(100),
    content: z.string().min(6, { message: "Content must be at least 6 characters long" }).max(100),
    isPinned: z.boolean(),
    tags: z.array(z.string()),
    userId: z.string(),
    images: z.array(z.instanceof(Buffer)),
})

const updateNoteSchema = z.object({
    title: z.string().min(6, { message: "Title must be at least 6 characters long" }).max(100),
    content: z.string().min(6, { message: "Content must be at least 6 characters long" }).max(100),
    isPinned: z.boolean(),
    tags: z.array(z.string()),
    imageOld: z.array(z.string()),
    images: z.array(z.instanceof(Buffer)),
})

const updateNoteIsPinnedSchema = z.object({
    isPinned: z.boolean()
})


export { createNoteSchema, updateNoteSchema, updateNoteIsPinnedSchema }