import {Request, Response, NextFunction } from 'express';
import { inviteMember } from './org.service';

export const inviteMemberController = async (req:Request, res:Response, next:NextFunction) => {
    try{
        const { email, role, orgId } = req.body;
        const invitation = await inviteMember({ email, role, orgId });
        res.status(201).json({
            success: true,
            message: "Invitation sent successfully",
            data: invitation
        });
    }catch(error){
        next(error)
    }
}

