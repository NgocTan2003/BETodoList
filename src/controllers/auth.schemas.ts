import { z } from "zod";

const emailSchema = z.string().email({ message: 'Invalid email address' }).min(1).max(100);
const passwordSchema = z.string().min(6, { message: 'Password must be at least 6 characters long' }).max(100);

const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    userAgent: z.string().optional(),
})

const registerSchema = loginSchema.extend({
    fullName: z.string().min(6, { message: 'FullName must be at least 6 characters long' }).max(100),
    confirmPassword: z.string().min(6, { message: 'Confirm Password must be at least 6 characters long' }).max(100),
})
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });


export { loginSchema, registerSchema }