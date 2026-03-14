import {z} from "zod";

export const registerSchema = z.object({
    name: z.string().nonempty({message:"Name is required"}).min(3, "Name must be at least 3 characters long"),
    email: z.string().nonempty({message:"Email is required"}).email("Invalid email address"),
    password: z.string().nonempty({message:"Password is required"}).min(6, "Password must be at least 6 characters long"),
    organizationName: z.string().nonempty({message:"Organization name is required"}).min(3, "Organization name must be at least 3 characters long")
});

export const loginSchema = z.object({
    email: z.string().nonempty({message:"Email is required"}).email("Invalid email address"),
    password: z.string().nonempty({message:"Password is required"}).min(6, "Password must be at least 6 characters long")
});

export type RegisterInput = z.infer<typeof registerSchema>; 
export type LoginInput = z.infer<typeof loginSchema>; 