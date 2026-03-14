import {z} from "zod";

export const registerSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    organizationName: z.string().min(3)
});

export type RegisterInput = z.infer<typeof registerSchema>; 