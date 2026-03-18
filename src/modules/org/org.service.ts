import { AppError } from "./../../utils/AppError";
import { prisma } from "../../lib/prisma";
import { InviteMemberInput, AcceptInviteInput, Role } from "./org.schema";
import { hashPassword } from "../../utils/password";
import config from "../../config/config";
import { generateHashToken, generateRawToken } from "../../utils/tokens";

export const inviteMember = async (data: InviteMemberInput) => {
  const { email, role, orgId } = data;

  // check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("User already a part of an organization", 400);
  }

  const rawToken = generateRawToken();
  const hashedToken = generateHashToken(rawToken);
  // create invitation
  await prisma.invitation.create({
    data: {
      email,
      role,
      organizationId: orgId,
      token:hashedToken,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour in miliseconds
    },
  });

  const inviteLink = `${config.frontendUrl}/accept-invite/${rawToken}`;

  //todo : send invite email

  return inviteLink;
};

export const acceptInvite = async (data: AcceptInviteInput) => {
  const { name, email, password, token } = data;

  const hashedToken = generateHashToken(token);

  // 1️⃣ get invitation
  const invitation = await prisma.invitation.findUnique({
    where: { token : hashedToken },
  });

  if (!invitation) {
    throw new AppError("Invitation not found", 404);
  }

  // 2️⃣ already accepted
  if (invitation.accepted) {
    throw new AppError("Invitation already accepted.", 400);
  }

  // 3️⃣ expiration check
  if (invitation.expiresAt < new Date()) {
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

  return true;
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
    select:{
       id:true,
       email:true,
       role:true,
       organizationId:true,

    }
  });

  if (!result) {
    throw new AppError("Member not found.", 404);
  }

  return result;
};
