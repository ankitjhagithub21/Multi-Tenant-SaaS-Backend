import { acceptInviteController, deleteMembersController, getMembersController, inviteMemberController, updateRoleController , getInvitationsController, cancelInvitationController} from './org.controller';
import { isAuth } from './../../middlewares/isAuth';
import { Role } from '../../generated/prisma/enums';
import { checkRole } from './../../middlewares/checkRole';
import {Router} from "express";
import { validateBody } from '../../middlewares/validateBody';
import { acceptInviteSchema, inviteMemberSchema } from './org.schema';



const router = Router();

router.post(
  "/invite-member",
  isAuth,
  checkRole(Role.ADMIN),
  validateBody(inviteMemberSchema),
  inviteMemberController
);

router.post(
  "/accept-invite/:token",
  validateBody(acceptInviteSchema),
  acceptInviteController
);

router.get("/invitations", isAuth , checkRole(Role.ADMIN), getInvitationsController)


router.delete(
  "/invitations/:id",
  cancelInvitationController
);

router.get("/members", isAuth, getMembersController)

router.delete("/members/:memberId", isAuth, checkRole(Role.ADMIN), deleteMembersController)

router.patch("/members/:memberId",isAuth, checkRole(Role.ADMIN), updateRoleController)



export default router;