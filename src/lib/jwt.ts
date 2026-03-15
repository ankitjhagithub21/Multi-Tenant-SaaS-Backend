import { Role } from './../generated/prisma/enums';
import jwt from 'jsonwebtoken';
import config from '../config/config';


export const generateToken = (userId: string, organizationId:string, role:Role) => {
  return jwt.sign({ id:userId, orgId:organizationId, role }, config.jwtSecret, { expiresIn: '1d' });
};

export const verifyToken = (token:string) => {
  return  jwt.verify(token, config.jwtSecret) as { id: string; orgId: string; role: Role };
}