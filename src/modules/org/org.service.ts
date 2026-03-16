import { AppError } from './../../utils/AppError';
import { prisma } from "../../lib/prisma";
import { InviteMemberInput, AcceptInviteInput} from "./org.schema";
import { hashPassword } from '../../utils/password';
import { generateInviteToken } from '../../utils/generateInviteToken';
import config from '../../config/config';

export const inviteMember = async (data: InviteMemberInput) => {
  const { email, role , orgId } = data;
  
  // check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("User already a part of an organization", 400);
  }

  const token = generateInviteToken()

  // create invitation
  await prisma.invitation.create({
    data: {
      email,
      role,
      organizationId:orgId,
      token,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour in miliseconds
    },
  });


  const inviteLink = `${config.frontendUrl}/accept-invite/${token}`;


  //todo : send invite email 

  return inviteLink;
}

export const acceptInvite = async (data: AcceptInviteInput) => {
  const { name, email, password, orgId, accepted, token } = data;
  

  //step 1 : get token and check expiration in one query
  const invitation = await prisma.invitation.findUnique({
    where: { token }
  })

  if(!invitation){
    throw new AppError("Invitation not found", 404)
  }

  if(invitation.accepted){
     throw new AppError("Invitation already accpeted.", 400)
  }

  //step 2 : check expiration
  if(Date.now() > new Date(invitation.expiresAt).getTime()){
     throw new AppError("Invitation is expired.", 400)
  }


  if(token !== invitation.token){
     throw new AppError("Invalid invitation link.", 400)
  }

  if(!accepted){
     // Update invitation as rejected and return
     await prisma.invitation.update({
       where: { id: invitation.id },
       data: { accepted: false }
     });
     return null;
  }

  //step 3 : create user and update invitation in parallel
  const hashedPassword = await hashPassword(password)
  
  const [user] = await prisma.$transaction([
    prisma.user.create({
      data:{
         name, 
         email,
         password: hashedPassword,
         role:invitation.role,
         organizationId: orgId
      }
    }),
    prisma.invitation.update({
      where: { id: invitation.id },
      data: { accepted: true }
    })
  ]);

  return {
    orgId:user.organizationId,
    role:user.role
  };
}