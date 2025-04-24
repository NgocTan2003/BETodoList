import { z } from "zod";

const createNoteSchema = z.object({
    title: z.string().min(6, { message: "Title must be at least 6 characters long" }).max(100),
    content: z.string().min(6, { message: "Content must be at least 6 characters long" }).max(100),
    isPinned: z.boolean(),
    tags: z.array(z.string()),
    userId: z.string().nonempty({ message: "UserId is required" }),
    images: z.array(z.string())
})

const upateNoteSchema = z.object({
    title: z.string().min(6, { message: "Title must be at least 6 characters long" }).max(100),
    content: z.string().min(6, { message: "Content must be at least 6 characters long" }).max(100),
    isPinned: z.boolean(),
    tags: z.array(z.string()),
    userId: z.string().nonempty({ message: "UserId is required" }),
    image: z.string()
})

const updateNoteIsPinnedSchema = z.object({
    isPinned: z.boolean()
})


export { createNoteSchema, upateNoteSchema, updateNoteIsPinnedSchema }