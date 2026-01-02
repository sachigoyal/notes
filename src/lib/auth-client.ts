import { createAuthClient } from "better-auth/react"
export const { useSession, signIn, signUp, signOut } = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL as string
})