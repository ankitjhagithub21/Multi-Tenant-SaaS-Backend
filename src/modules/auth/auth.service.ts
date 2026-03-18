import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { LoginInput, RegisterInput } from "./auth.schema";
import { generateToken } from "../../lib/jwt";
import { comparePassword, hashPassword } from "../../utils/password";
import config from "../../config/config";
import { generateHashToken, generateRawToken } from "../../utils/tokens";

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
  const hashedPassword = await hashPassword(password);
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
        role: "ADMIN",
        organizationId: organization.id,
      },
    });

    return user;
  });

  return {
    id: result.id,
    email: result.email,
    name: result.name,
    organizationId: result.organizationId,
  };
};

export const loginUser = async (data: LoginInput) => {
  const { email, password } = data;

  // check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    throw new AppError("Invalid credentials", 401);
  }

  // compare password
  const isValidPassword = await comparePassword(
    password,
    existingUser.password,
  );

  if (!isValidPassword) {
    throw new AppError("Invalid credentials", 401);
  }
  // generate JWT token

  const token = generateToken(
    existingUser.id,
    existingUser.organizationId,
    existingUser.role,
  );

  return {
    token,
    user: {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      orgId: existingUser.organizationId,
      role: existingUser.role,
    },
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      organizationId: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const rawToken = generateRawToken();
  const hashedToken = generateHashToken(rawToken);

  // 3️⃣ Delete old tokens (optional but recommended)
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  });

  // 4️⃣ Set expiry (e.g., 15 minutes)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // 5️⃣ Store in DB
  await prisma.passwordResetToken.create({
    data: {
      token:hashedToken,
      userId: user.id,
      expiresAt,
    },
  });

  // 6️⃣ Create reset link (frontend URL)
  const resetLink = `${config.frontendUrl}/reset-password?token=${rawToken}`;

  // 7️⃣ Send email
  // await sendEmail({
  //   to: user.email,
  //   subject: "Reset your password",
  //   html: `
  //     <p>Hi ${user.name},</p>
  //     <p>Click below to reset your password:</p>
  //     <a href="${resetLink}">${resetLink}</a>
  //     <p>This link will expire in 15 minutes.</p>
  //   `,
  // });

  return resetLink;
};

export const resetPassword = async (token: string, newPassword: string) => {

   const hashedToken = generateHashToken(token)

  // 1️⃣ Find token in DB
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token:hashedToken},
    include: { user: true },
  });

  if (!resetToken) {
    throw new AppError("Invalid or expired token.", 400);
  }

  // 2. Check expiry
  if (resetToken.expiresAt < new Date()) {
    // delete expired token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    throw new AppError("Token expired", 400);
  }

  // 3. hash password
  const hashedPassword = await hashPassword(newPassword);

  // 4. Store in DB
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: {
      password: hashedPassword,
    },
  });

  // 5. Delete all reset tokens for this user (important 🔥)
  await prisma.passwordResetToken.deleteMany({
    where: { userId: resetToken.userId },
  });
};
