import { acceptInviteController, deleteMembersController, getMembersController, inviteMemberController, updateRoleController , getInvitationsController, cancelInvitationController} from './org.controller';
import { isAuth } from './../../middlewares/isAuth';
import { Role } from '../../generated/prisma/enums';
import { checkRole } from './../../middlewares/checkRole';
import {Router} from "express";
import { validateBody } from '../../middlewares/validateBody';
import { acceptInviteSchema, inviteMemberSchema } from './org.schema';
import { generalLimiter, authLightLimiter } from '../../middlewares/rateLimiter';



const router = Router();

// Apply general rate limiting to all organization routes
router.use(generalLimiter);

// Admin operations - invite members (already protected by auth and role)
router.post(
  "/invite-member",
  isAuth,
  checkRole(Role.ADMIN),
  validateBody(inviteMemberSchema),
  inviteMemberController
);

// Public endpoint - accept invitation (lighter rate limiting)
router.post(
  "/accept-invite/:token",
  authLightLimiter,
  validateBody(acceptInviteSchema),
  acceptInviteController
);

// Admin operations - manage invitations
router.get("/invitations", isAuth , checkRole(Role.ADMIN), getInvitationsController)
router.delete(
  "/invitations/:id",
  isAuth,
  cancelInvitationController
);

// Member management operations
router.get("/members", isAuth, getMembersController)
router.delete("/members/:memberId", isAuth, checkRole(Role.ADMIN), deleteMembersController)
router.patch("/members/:memberId",isAuth, checkRole(Role.ADMIN), updateRoleController)



export default router;