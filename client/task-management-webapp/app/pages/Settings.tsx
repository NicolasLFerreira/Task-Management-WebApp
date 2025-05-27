"use client";

import { useState, useRef } from "react";
import PageContainer from "../components/PageContainer";

const Settings = () => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [userData, setUserData] = useState({
		username: "JohnDoe",
		email: "john.doe@example.com",
		fullName: "",
		bio: "",
		location: "",
		phoneNumber: "",
	});
	const [profileImage, setProfileImage] = useState<string | null>(null);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setUserData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleImageClick = () => {
		fileInputRef.current?.click();
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				setProfileImage(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Here you would typically send the data to your backend API
		console.log("Submitting user data:", userData);
		console.log("Profile image:", profileImage);
		// Show success message
		alert("Profile updated successfully!");
	};

	return (
		<PageContainer>
			<div className="p-6 max-w-4xl mx-auto">
				<h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
					Settings
				</h1>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
					<h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
						User Profile
					</h2>

					<form onSubmit={handleSubmit}>
						{/* Profile Picture */}
						<div className="flex flex-col items-center mb-6">
							<div
								onClick={handleImageClick}
								className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 cursor-pointer mb-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700"
							>
								{profileImage ? (
									<img
										src={profileImage}
										alt="Profile"
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="text-gray-400 dark:text-gray-500 text-5xl font-light">
										{userData.username
											.charAt(0)
											.toUpperCase()}
									</div>
								)}
								<div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 flex items-center justify-center transition-all duration-200">
									<span className="text-white opacity-0 hover:opacity-100">
										Change
									</span>
								</div>
							</div>
							<input
								type="file"
								ref={fileInputRef}
								onChange={handleImageChange}
								accept="image/*"
								className="hidden"
							/>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Click to upload a profile picture
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
							{/* Username field */}
							<div>
								<label
									htmlFor="username"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Username
								</label>
								<input
									type="text"
									id="username"
									name="username"
									value={userData.username}
									onChange={handleChange}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
									required
								/>
							</div>

							{/* Email field */}
							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Email Address
								</label>
								<input
									type="email"
									id="email"
									name="email"
									value={userData.email}
									onChange={handleChange}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
									required
								/>
							</div>
						</div>

						<h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
							Additional Information
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
							{/* Full Name field */}
							<div>
								<label
									htmlFor="fullName"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Full Name
								</label>
								<input
									type="text"
									id="fullName"
									name="fullName"
									value={userData.fullName}
									onChange={handleChange}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
								/>
							</div>

							{/* Phone Number field */}
							<div>
								<label
									htmlFor="phoneNumber"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Phone Number
								</label>
								<input
									type="tel"
									id="phoneNumber"
									name="phoneNumber"
									value={userData.phoneNumber}
									onChange={handleChange}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
								/>
							</div>

							{/* Location field */}
							<div>
								<label
									htmlFor="location"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Location
								</label>
								<input
									type="text"
									id="location"
									name="location"
									value={userData.location}
									onChange={handleChange}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
								/>
							</div>

							{/* Bio field */}
							<div className="md:col-span-2">
								<label
									htmlFor="bio"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Bio
								</label>
								<textarea
									id="bio"
									name="bio"
									value={userData.bio}
									onChange={handleChange}
									rows={3}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
								></textarea>
							</div>
						</div>

						<div className="flex justify-end">
							<button
								type="submit"
								className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
							>
								Save Changes
							</button>
						</div>
					</form>
				</div>
			</div>
		</PageContainer>
	);
};

export default Settings;
