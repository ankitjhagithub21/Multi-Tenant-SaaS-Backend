import bcrypt from "bcryptjs"

export const hashPassword = async(password:string) => {
    const hashedPassword = await bcrypt.hash(password, 12);
    return hashedPassword;
}

export const comparePassword = async(oldPassword:string, newPassword:string) => {
    const isValidPassword = await bcrypt.compare(oldPassword, newPassword);
    return isValidPassword;
}
