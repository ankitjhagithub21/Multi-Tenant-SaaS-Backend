import { acceptInviteController, inviteMemberController } from './org.controller';
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


export default router;