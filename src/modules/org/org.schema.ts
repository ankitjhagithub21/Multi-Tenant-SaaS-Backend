import {z} from "zod";

const UserRoles = ["ADMIN", "MEMBER"] as const;

const RoleSchema = z.enum(UserRoles);

export const inviteMemberSchema = z.object({
    email:z.string().nonempty({message:"Email is required."}).email("Invalid email address"),
    role:z.enum(UserRoles),
    orgId:z.string().nonempty({message:"Organization ID is required."})
});


export type Role = z.infer<typeof RoleSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>; 
