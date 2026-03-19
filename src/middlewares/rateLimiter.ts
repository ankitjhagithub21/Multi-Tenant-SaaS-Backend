import { rateLimit } from 'express-rate-limit'


const createRateLimit = (windowMs:number, limit:number, message:string) => rateLimit({
	windowMs: windowMs, 
	limit:limit,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	ipv6Subnet: 56,
	message: {
		error: message
	}
})

// General API rate limiter
export const generalLimiter = createRateLimit(15 * 60 * 1000, 100, "Too many requests, please try again later.");

// Strict limiter for authentication endpoints (login, register)
export const authStrictLimiter = createRateLimit(15 * 60 * 1000, 5, "Too many auth request.")

// Moderate limiter for password reset endpoints
export const authModerateLimiter = createRateLimit(60 * 60 * 1000, 3, "Too many password reset attempts from this IP, please try again later.")

// Light limiter for other auth endpoints (logout, get user)
export const authLightLimiter = createRateLimit(15 * 60 * 1000, 50, 'Too many requests from this IP, please try again later.')
