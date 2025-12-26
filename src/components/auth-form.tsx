"use client";

import { Button } from "@/components/ui/button";
import { GithubIcon, GoogleIcon } from "@/lib/icon";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";

interface AuthFormProps {
	mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
	const isLogin = mode === "login";

	const handleSocialSignUp = async (provider: "google" | "github") => {
		const { error } = await signIn.social({
			provider,
			callbackURL: "/",
		});

		if (error) {
			const action = isLogin ? "sign in" : "sign up";
			toast.error(error.message || `Failed to ${action} with ${provider === "google" ? "Google" : "GitHub"}`);
		}
	};

	return (
		<>
			<div className="text-center mb-5">
				<h2 className="text-3xl font-bold mb-1">
					{isLogin ? "Login to your account" : "Create an account"}
				</h2>
				<p className="text-sm text-muted-foreground">
					{isLogin ? "Login to your account to continue" : "Sign up to your account to continue"}
				</p>
			</div>

			<div className='flex flex-col gap-4 w-sm my-2'>
				<Button
					variant="outline"
					className="flex-1 cursor-pointer h-10 text-md rounded-none"
					onClick={() => handleSocialSignUp("google")}
				>
					<GoogleIcon />
					Continue with Google
				</Button>

				<Button
					variant="outline"
					className="flex-1 cursor-pointer h-10 text-md rounded-none"
					onClick={() => handleSocialSignUp("github")}
				>
					<GithubIcon />
					Continue with GitHub
				</Button>
			</div>

			<div className="mt-4 text-center">
				<p className="text-sm text-muted-foreground">
					{isLogin ? (
						<>
							Don't have an account?{" "}
							<Link
								href="/signup"
								className="font-medium text-primary hover:underline"
							>
								Sign Up
							</Link>
						</>
					) : (
						<>
							Already have an account?{" "}
							<Link
								href="/login"
								className="font-medium text-primary hover:underline"
							>
								Sign In
							</Link>
						</>
					)}
				</p>
			</div>
		</>
	);
}
