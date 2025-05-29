"use client";

import React, { useState, useEffect, type ChangeEvent } from "react";
import { AccountService } from "../../../api-client";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { cn } from "../../lib/utils";
import { getErrorMessage, logError } from "../../utils/errorHandler";

interface RegisterFormProps {
	onSuccess: () => void;
	onLoginClick: () => void;
}

type FormData = {
	firstName: string;
	lastName: string;
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
};

const RegisterForm = ({ onSuccess, onLoginClick }: RegisterFormProps) => {
	const [formData, setFormData] = useState<FormData>({
		firstName: "",
		lastName: "",
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [passwordFocused, setPasswordFocused] = useState(false);
	const [passwordScore, setPasswordScore] = useState(0);
	const [success, setSuccess] = useState(false);

	const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		// Validate passwords match
		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		// Validate password strength
		if (passwordScore < 3) {
			setError("Please create a stronger password");
			return;
		}

		// Validate email format
		if (!emailRegex.test(formData.email)) {
			setError("Please enter a valid email address");
			return;
		}

		// Validate username
		if (!formData.username) {
			setError("Username is required");
			return;
		}

		setIsLoading(true);

		try {
			// Construct the full name by combining firstName and lastName
			const name = `${formData.firstName} ${formData.lastName}`.trim();

			// Log the exact request body we're sending
			const requestBody = {
				name,
				email: formData.email,
				password: formData.password,
				username: formData.username,
				firstName: formData.firstName,
				lastName: formData.lastName,
			};

			const response = await AccountService.register({
				body: requestBody,
			});

			if (response.data) {
				// Registration successful
				setSuccess(true);
				setTimeout(() => {
					onSuccess();
				}, 2000);
			} else {
				setError("Registration failed");
			}
		} catch (err: unknown) {
			logError(err, "RegisterForm.handleSubmit");
			setError(getErrorMessage(err));
		} finally {
			setIsLoading(false);
		}
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handlePasswordScoreChange = (score: number) => {
		setPasswordScore(score);
	};

	if (success) {
		return (
			<div className="w-full max-w-md mx-auto">
				<div className="bg-white p-8 rounded-lg shadow-md">
					<div className="text-center py-6">
						<div className="mx-auto mb-4 h-16 w-16 text-green-500 flex items-center justify-center">
							<span className="text-4xl" aria-hidden="true">
								✓
							</span>
						</div>
						<h3 className="mb-2 text-xl font-semibold">
							Registration Successful!
						</h3>
						<p className="text-gray-600">
							Your account has been created successfully. You can
							now log in with your credentials.
						</p>
						<button
							onClick={onLoginClick}
							className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
						>
							Go to Login
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full max-w-md mx-auto">
			<div className="bg-white p-8 rounded-lg shadow-md">
				<div className="flex items-center gap-2 mb-6">
					<div className="bg-teal-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
						TW
					</div>
					<h2 className="text-2xl font-bold text-gray-800">
						Tickaway
					</h2>
				</div>

				<h2 className="text-2xl font-bold text-gray-800 mb-2">
					Create an Account
				</h2>
				<p className="text-gray-600 mb-6">
					Enter your information to create an account
				</p>

				{error && (
					<div
						className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
						role="alert"
					>
						<span className="block sm:inline">{error}</span>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="firstName"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								First Name
							</label>
							<input
								id="firstName"
								name="firstName"
								type="text"
								value={formData.firstName}
								onChange={handleChange}
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900"
								placeholder="First Name"
							/>
						</div>
						<div>
							<label
								htmlFor="lastName"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Last Name
							</label>
							<input
								id="lastName"
								name="lastName"
								type="text"
								value={formData.lastName}
								onChange={handleChange}
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900"
								placeholder="Last Name"
							/>
						</div>
					</div>

					<div>
						<label
							htmlFor="username"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Username
						</label>
						<input
							id="username"
							name="username"
							type="text"
							value={formData.username}
							onChange={handleChange}
							required
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900"
							placeholder="Username"
						/>
					</div>

					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Email
						</label>
						<input
							id="email"
							name="email"
							type="email"
							value={formData.email}
							onChange={handleChange}
							required
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900"
							placeholder="your@email.com"
							aria-describedby={
								!emailRegex.test(formData.email) &&
								formData.email
									? "email-error"
									: undefined
							}
						/>
						{!emailRegex.test(formData.email) && formData.email && (
							<p
								id="email-error"
								className="mt-1 text-sm text-red-600"
							>
								Please enter a valid email address
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Password
						</label>
						<input
							id="password"
							name="password"
							type="password"
							value={formData.password}
							onChange={handleChange}
							onFocus={() => setPasswordFocused(true)}
							required
							className={cn(
								"w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none text-gray-900",
								passwordScore >= 3
									? "border-green-500 focus:ring-green-500 focus:border-green-500"
									: "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
							)}
							aria-describedby="password-strength"
						/>
						{passwordFocused && formData.password.length > 0 && (
							<div id="password-strength">
								<PasswordStrengthMeter
									password={formData.password}
									onScoreChange={handlePasswordScoreChange}
								/>
							</div>
						)}
					</div>

					<div>
						<label
							htmlFor="confirmPassword"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Confirm Password
						</label>
						<input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							value={formData.confirmPassword}
							onChange={handleChange}
							required
							className={cn(
								"w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none text-gray-900",
								formData.confirmPassword &&
									formData.password ===
										formData.confirmPassword
									? "border-green-500 focus:ring-green-500 focus:border-green-500"
									: "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
							)}
							aria-describedby={
								formData.confirmPassword &&
								formData.password !== formData.confirmPassword
									? "confirm-password-error"
									: undefined
							}
						/>
						{formData.confirmPassword &&
							formData.password !== formData.confirmPassword && (
								<p
									id="confirm-password-error"
									className="mt-1 text-sm text-red-600"
								>
									Passwords do not match
								</p>
							)}
					</div>

					<div>
						<button
							disabled={isLoading}
							type="submit"
							className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
						>
							{isLoading ? "Creating Account..." : "Register"}
						</button>
					</div>
				</form>

				<div className="mt-6 text-center">
					<p className="text-sm text-gray-600">
						Already have an account?{" "}
						<button
							onClick={onLoginClick}
							className="font-medium text-teal-600 hover:text-teal-500 focus:outline-none"
						>
							Login
						</button>
					</p>
				</div>
			</div>
		</div>
	);
};

export default RegisterForm;
