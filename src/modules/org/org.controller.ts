import { Request, Response, NextFunction } from "express";
import {
  acceptInvite,
  inviteMember,
  getMembers,
  deleteMember,
  updateRole,
} from "./org.service";
import { AppError } from "../../utils/AppError";


export const inviteMemberController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, role } = req.body;

    if (!req.user?.orgId) {
      throw new AppError("Organization id is required.", 400);
    }

    const inviteLink = await inviteMember({
      email,
      role,
      orgId: req.user.orgId,
    });

    res.status(201).json({
      success: true,
      message: "Invitation sent successfully",
      inviteLink,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptInviteController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;

    const token = req.params.token as string;

    const result = await acceptInvite({ name, email, password, token });

    res.status(201).json({
      success: true,
      message: "You have joined the organization.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMembersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.orgId) {
      throw new AppError("Organization id is required.", 401);
    }

    const orgId = req.user.orgId;

    const result = await getMembers(orgId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMembersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const memberId = req.params.memberId as string;

    if (!req.user?.orgId) {
      throw new AppError("Organization id is required.", 401);
    }

    const orgId = req.user.orgId;

    await deleteMember(orgId, memberId);

    res.status(200).json({
        success:true,
        message:"Member deleted successfully."
    });
  } catch (error) {
    next(error);
  }
};


export const updateRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const memberId = req.params.memberId as string;

    const {role} = req.body;

    if (!req.user?.orgId) {
      throw new AppError("Organization id is required.", 401);
    }

    const orgId = req.user.orgId;

    const result = await updateRole(orgId, memberId, role);

    res.status(200).json({
        success:true,
        message:"Member role updated successfully.",
        data:{
           orgId:result.organizationId,
           newRole:result.role
        }
    });
  } catch (error) {
    next(error);
  }
};