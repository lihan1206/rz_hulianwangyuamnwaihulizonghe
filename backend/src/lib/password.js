import bcrypt from "bcryptjs";

export const verifyPwd = (plainText, hashed) => bcrypt.compare(plainText, hashed);
