import config from '../config/config';

export const cookieOptions = {
   httpOnly:true,
   secure:config.nodeEnv === "production",
   sameSite:'strict' as const,
   maxAge: 86400000 // 1 day in miliseconds
}