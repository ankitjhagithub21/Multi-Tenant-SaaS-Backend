import jwt from 'jsonwebtoken';
import config from '../config/config';


export const generateToken = (userId: string, organizationId:string) => {
  return jwt.sign({ userId, organizationId }, config.jwtSecret, { expiresIn: '1d' });
};

export const verifyToken = (token:string) => {
  return  jwt.verify(token, config.jwtSecret);  
}