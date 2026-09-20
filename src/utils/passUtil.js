import bcrypt from "bcryptjs";

export const hashPass = async(plainPass)=>
    {
        const salt = 10;
        return await bcrypt.hash(plainPass , salt)
    }

export const comparePass = async (plainPass , hashPass)=>
    {
        return await bcrypt.compare(plainPass , hashPass)
    }
