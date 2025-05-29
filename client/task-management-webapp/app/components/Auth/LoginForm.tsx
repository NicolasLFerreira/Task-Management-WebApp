"use client";

import { useState } from "react";
import { AccountService } from "../../../api-client";
import { getErrorMessage, logError } from "../../utils/errorHandler";
import FormInputName from "../Common/FormInputName";
import FormTitle from "../Common/FormTitle";

interface LoginFormProps {
	onSuccess: (token: string) => void;
	onRegisterClick: () => void;
}

type FormData = {
	email: string;
	password: string;
	rememberMe: boolean;
};

const LoginForm = ({ onSuccess, onRegisterClick }: LoginFormProps) => {
	const [formData, setFormData] = useState<FormData>({
		email: "",
		password: "",
		rememberMe: true,
	});
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setError(null);
		setIsLoading(true);

		try {
			console.log("Attempting login with:", { email: formData.email });
			const response = await AccountService.login({
				body: {
					email: formData.email,
					password: formData.password,
					rememberMe: formData.rememberMe,
				},
			});

			console.log("Login API response:", response);

			if (response.data) {
				// Store token and redirect
				onSuccess(response.data);
			} else {
				setError("Invalid login response");
			}
		} catch (err: unknown) {
			logError(err, "LoginForm.handleSubmit");
			setError(getErrorMessage(err));
		} finally {
			setIsLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, type, value, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	return (
		<div className="w-full max-w-md mx-auto">
			<div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
				<div className="flex items-center gap-2 mb-6">
					<div className="bg-teal-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
						TW
					</div>
					<FormTitle content="Tickaway" size="text-3xl" />
				</div>

				<h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
					Login
				</h2>
				<p className="text-gray-600 dark:text-gray-100 mb-6">
					Enter your credentials to access your account
				</p>

				{error && (
					<div
						className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
						role="alert"
					>
						<span className="block sm:inline">{error}</span>
					</div>
				)}

				<form className="space-y-6" onSubmit={handleSubmit}>
					<div>
						<FormInputName name="email">Email</FormInputName>
						<input
							id="email"
							name="email"
							type="email"
							value={formData.email}
							onChange={handleChange}
							className="placeholder-gray-900 dark:placeholder-gray-400 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900 dark:text-white"
							placeholder="your@email.com"
							autoFocus
							required
						/>
					</div>

					<div>
						<FormInputName name="password">Password</FormInputName>
						<input
							id="password"
							name="password"
							type="password"
							value={formData.password}
							onChange={handleChange}
							className="placeholder-gray-900 dark:placeholder-gray-400 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900 dark:text-white"
							placeholder="secure password"
							required
						/>
					</div>

					<div className="flex items-center">
						<input
							id="rememberMe"
							name="rememberMe"
							type="checkbox"
							checked={formData.rememberMe}
							onChange={handleChange}
							className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
						/>
						<FormInputName name="rememberMe" extraStyle="ml-2">
							Remember me
						</FormInputName>
					</div>

					<div>
						<button
							disabled={isLoading}
							type="submit"
							className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
						>
							{isLoading ? "Logging in..." : "Login"}
						</button>
					</div>
				</form>

				<div className="mt-6 text-center">
					<p className="text-sm text-gray-600">
						Don't have an account?{" "}
						<button
							onClick={onRegisterClick}
							className="font-medium text-teal-600 hover:text-teal-500 focus:outline-none"
						>
							Register
						</button>
					</p>
				</div>
			</div>
		</div>
	);
};

export default LoginForm;
