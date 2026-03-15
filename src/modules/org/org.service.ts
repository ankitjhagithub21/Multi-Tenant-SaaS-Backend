import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import generateOtp from "../../utils/generateOtp";
import { InviteMemberInput } from "./org.schema";

export const inviteMember = async (data: InviteMemberInput) => {
  const { email, role, orgId } = data;
  
  // check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  // create invitation
  const invitation = await prisma.invitation.create({
    data: {
      email,
      role,
      organizationId:orgId,
      token: generateOtp(),
      expiresAt: new Date(Date.now() + 3600000), // 1 hour in miliseconds
    },
  });

  return invitation;
}