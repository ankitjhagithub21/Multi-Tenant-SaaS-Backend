import { inviteMemberController } from './org.controller';
import { isAuth } from './../../middlewares/isAuth';
import { Role } from '../../generated/prisma/enums';
import { checkRole } from './../../middlewares/checkRole';
import {Router} from "express";

const router = Router();

router.post(
  "/invite-member",
  isAuth,
  checkRole(Role.ADMIN),
  inviteMemberController
);


export default router;