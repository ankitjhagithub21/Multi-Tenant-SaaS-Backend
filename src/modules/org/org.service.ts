import { AppError } from "./../../utils/AppError";
import { prisma } from "../../lib/prisma";
import { InviteMemberInput, AcceptInviteInput, Role } from "./org.schema";
import { hashPassword } from "../../utils/password";
import config from "../../config/config";
import { generateHashToken, generateRawToken } from "../../utils/tokens";
import { add, isBefore } from "date-fns";

export const inviteMember = async (data: InviteMemberInput) => {
  const { email, role, orgId, invitedById } = data;

  // check if user already exists in same org
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser && existingUser.organizationId === orgId) {
    throw new AppError("User already a member of this organization", 400);
  }

  // check duplicate invite
  const existingInvite = await prisma.invitation.findFirst({
    where: {
      email,
      organizationId: orgId,
      accepted: false,
    },
  });

  if (existingInvite) {
    throw new AppError("User already invited", 400);
  }

  // generate tokens
  const rawToken = generateRawToken();
  const hashedToken = generateHashToken(rawToken);

  // expiry
  const expiresAt = add(new Date(Date.now()), { minutes: 15 });

  // create invitation
  await prisma.invitation.create({
    data: {
      email,
      role,
      organizationId: orgId,
      token: hashedToken,
      expiresAt,
      invitedById,
    },
  });

  const inviteLink = `${config.frontendUrl}/accept-invite/${rawToken}`;

  // TODO: send email
  return inviteLink;
};

export const acceptInvite = async (data: AcceptInviteInput) => {
  const { name, email, password, token } = data;

  const hashedToken = generateHashToken(token);

  // 1️⃣ get invitation
  const invitation = await prisma.invitation.findUnique({
    where: { token: hashedToken },
  });

  if (!invitation) {
    throw new AppError("Invitation not found", 404);
  }

  // 2️⃣ already accepted
  if (invitation.accepted) {
    throw new AppError("Invitation already accepted.", 400);
  }

  if (isBefore(invitation.expiresAt, new Date())) {
    throw new AppError("Invitation expired.", 400);
  }

  // 4️⃣ email validation
  if (invitation.email !== email) {
    throw new AppError("This invitation is not for this email.", 403);
  }

  // 5️⃣ prevent duplicate users
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  // 6️⃣ hash password
  const hashedPassword = await hashPassword(password);

  // 7️⃣ transaction
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: invitation.role,
        organizationId: invitation.organizationId,
      },
    });

    await tx.invitation.update({
      where: { id: invitation.id },
      data: { accepted: true },
    });

    return user;
  });

  return {
    orgId: result.organizationId,
    role: result.role,
  };
};

export const getMembers = async (orgId: string) => {
  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!organization) {
    throw new AppError("Organization not found", 404);
  }

  return organization.users;
};

export const deleteMember = async (orgId: string, userId: string) => {
  const result = await prisma.user.delete({
    where: {
      id_organizationId: {
        id: userId,
        organizationId: orgId,
      },
    },
  });

  if (!result) {
    throw new AppError("Member not found", 404);
  }

  return {message:"Member deleted successfully."};
};

export const updateRole = async (orgId: string, userId: string, role: Role) => {
  const result = await prisma.user.update({
    where: {
      id_organizationId: {
        id: userId,
        organizationId: orgId,
      },
    },
    data: {
      role: role,
    },
    select: {
      id: true,
      email: true,
      role: true,
      organizationId: true,
    },
  });

  if (!result) {
    throw new AppError("Member not found.", 404);
  }

  return result;
};

export const getInvitations = async (orgId: string, accepted:boolean | undefined) => {
  
  const result = await prisma.invitation.findMany({
    where: {
      organizationId: orgId,
      ...(accepted !== undefined && {accepted})
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      expiresAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

export const cancelInvitation = async (id: string) => {

  const invitation = await prisma.invitation.findUnique({
    where:{
       id
    }
  })

  if(!invitation){
     throw new AppError("Invitation not found.", 404)
  }

  //already accepted 
  if(invitation.accepted){
     throw new AppError("Invitation already accepted.", 400)
  }

  await prisma.invitation.delete({
    where: {
      id,
    },
  });

  return { message: "Invitation cancelled successfully." };
}
