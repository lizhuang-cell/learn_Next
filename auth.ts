import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import  CredentialsProvider  from 'next-auth/providers/credentials';
import { z } from 'zod'; 
import type { User } from './app/lib/definitions';
import postgres from 'postgres';

import bcrypt from 'bcrypt';

const sql = postgres(process.env.POSTGRES_URL!,{ssl:'require'})


async function getUser(email:string) : Promise<User | null>{
    try {
        const user = await sql<User[]>`
        SELECT * FROM users WHERE email = ${email}
        `
        return user[0] || null
    } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Error fetching user')
    }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers:[
    CredentialsProvider({
        async authorize(credentials){
            const parsedCredentials  = z.object({
                email:z.string().email(),
                password:z.string().min(6)
            }).safeParse(credentials)

            if(parsedCredentials.success){
                const {email,password} = parsedCredentials.data
                const user =await getUser(email)
                if(!user){
                    console.log('用户不存在，认证失败')
                    return null
                }
                const comparePassword = await bcrypt.compare(password,user.password)

                if(comparePassword){
                    console.log('密码验证成功，返回用户信息')
                    return user
                }else{
                    console.log('密码错误，认证失败')
                }
            }
            console.log('无用的用户信息')
            return null
        }
    })
  ]
});