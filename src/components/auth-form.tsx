"use client";

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
		<div className="space-y-8">
			{/* Header */}
			<div className="space-y-2">
				<h1 className="text-2xl font-normal tracking-tight">
					{isLogin ? "Welcome back" : "Get started"}
				</h1>
				<p className="text-muted-foreground text-sm font-light">
					{isLogin 
						? "Sign in to continue to your notes" 
						: "Create an account to start writing"
					}
				</p>
			</div>

			{/* Social buttons */}
			<div className="space-y-3">
				<button
					onClick={() => handleSocialSignUp("github")}
					className="w-full h-11 flex items-center justify-center gap-3 border border-border rounded-lg bg-transparent hover:bg-muted/50 transition-colors text-sm font-normal cursor-pointer"
				>
					<GithubIcon className="w-4 h-4" />
					<span>Continue with GitHub</span>
				</button>
			</div>

			{/* Footer */}
			<p className="text-sm text-muted-foreground font-light">
				{isLogin ? (
					<>
						No account?{" "}
						<Link
							href="/signup"
							className="text-foreground hover:underline underline-offset-4 transition-colors"
						>
							Create one
						</Link>
					</>
				) : (
					<>
						Have an account?{" "}
						<Link
							href="/login"
							className="text-foreground hover:underline underline-offset-4 transition-colors"
						>
							Sign in
						</Link>
					</>
				)}
			</p>
		</div>
	);
}
