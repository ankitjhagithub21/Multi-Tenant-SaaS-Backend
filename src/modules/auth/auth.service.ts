import bcrypt from "bcryptjs";
import {prisma} from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { LoginInput, RegisterInput } from "./auth.schema";
import { generateToken } from "../../lib/jwt";


export const registerUser = async (data: RegisterInput) => {
  const { name, email, password, organizationName } = data;

  // check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  // create organization + user in transaction
  const result = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        organizationName,
      },
    });

    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role:"ADMIN",
        organizationId: organization.id,
      },
    });

    return user;
  });

  return {
     id: result.id,
     email:result.email,
     name:result.name,
     organizationId:result.organizationId
  };
};



export const loginUser = async (data: LoginInput) => {
  const { email, password} = data;

  // check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    throw new AppError("Invalid credentials", 401);
  }

  // compare password
  const comparePassword = await bcrypt.compare(password, existingUser.password);

  if (!comparePassword) {
    throw new AppError("Invalid credentials", 401);
  }
  // generate JWT token
  
  const token = generateToken(existingUser.id, existingUser.organizationId, existingUser.role)

  return {
    token,
    user:{
      id:existingUser.id,
      name:existingUser.name,
      email:existingUser.email,
      orgId:existingUser.organizationId,
      role:existingUser.role
    }
  };
};


export const getCurrentUser = async (userId: string) => {
  // check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  return {
    user:{
      id:existingUser.id,
      name:existingUser.name,
      email:existingUser.email,
      orgId:existingUser.organizationId,
      role:existingUser.role
    }
  };
};


