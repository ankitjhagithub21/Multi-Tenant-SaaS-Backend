import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {prisma} from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { RegisterInput } from "./auth.schema";


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

    return { user, organization };
  });

  return result;
};