import {Request, Response, NextFunction } from 'express';
import { acceptInvite, inviteMember } from './org.service';
import { AppError } from '../../utils/AppError';

export const inviteMemberController = async (req:Request, res:Response, next:NextFunction) => {
    try{
        const { email, role } = req.body;

         if(!req.user?.orgId){
            throw new AppError("Organization id is required.", 400)
        }

        const inviteLink = await inviteMember({ email, role, orgId:req.user.orgId });

        res.status(201).json({
            success: true,
            message: "Invitation sent successfully",
            inviteLink
        });

    }catch(error){
        next(error)
    }
}

export const acceptInviteController = async (req:Request, res:Response, next:NextFunction) => {
    try{
        const { name, email, password, accepted} = req.body;

        const token = req.params.token as string;

        if(!req.user?.orgId){
            throw new AppError("Organization id is required.", 400)
        }

        const result = await acceptInvite({ name, email, password, orgId:req.user.orgId, token, accepted });
        res.status(201).json({
            success: true,
            message: "Invitation accepted successfully",
            data: result
        });
    }catch(error){
        next(error)
    }
}


