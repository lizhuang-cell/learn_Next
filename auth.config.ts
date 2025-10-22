
import {NextAuthConfig} from 'next-auth'

export const authConfig = {
    providers:[
    ],
    pages:{
        signIn:'/login',
    },
    callbacks:{
        authorized({auth,request:{nextUrl}}){
            const isLogin = !!auth?.user
            console.log('%c [ authorized ]: ', 'color: #bf2c9f; background: pink; font-size: 13px;', '用户登录状态:', isLogin, '当前路径:', nextUrl.pathname)

            const isDashboardPath = nextUrl.pathname.startsWith('/dashboard')
            const isLoginPath = nextUrl.pathname === '/login'

            if(isLoginPath){
                // 如果已登录用户访问登录页，重定向到dashboard
                if(isLogin){
                    console.log('已登录用户访问登录页，重定向到dashboard')
                    return Response.redirect(new URL('/dashboard', nextUrl))
                }
                return true
            }

            if(isDashboardPath){
                if(isLogin){
                    return true
                }
                // 未登录用户访问dashboard，重定向到登录页
                console.log('未登录用户访问dashboard，重定向到登录页')
                return false
            }

            // 其他路径，允许访问
            return true
        }
    }
} satisfies NextAuthConfig  
