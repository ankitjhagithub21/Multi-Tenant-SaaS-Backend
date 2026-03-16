import {z} from "zod";

const UserRoles = ["ADMIN", "MEMBER"] as const;

const RoleSchema = z.enum(UserRoles);

export const inviteMemberSchema = z.object({
    email:z.string().nonempty({message:"Email is required."}).email("Invalid email address"),
    role:z.enum(UserRoles),
});

export const acceptInviteSchema = z.object({
    name: z.string().nonempty({message:"Name is required"}).min(3, "Name must be at least 3 characters long"),
    email: z.string().nonempty({message:"Email is required"}).email("Invalid email address"),
    password: z.string().nonempty({message:"Password is required"}).min(6, "Password must be at least 6 characters long"),
});



export type Role = z.infer<typeof RoleSchema>;


export interface InviteMemberInput {
     email:string;
     role:'ADMIN' | 'MEMBER';
     orgId:string;
}


export interface AcceptInviteInput {
     name:string;
     email:string;
     password:string;
     token:string;
}

export interface AcceptInviteParams {
  orgId: string
  token: string
}