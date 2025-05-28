"use client";

import { useState, useRef, useEffect } from "react";
import PageContainer from "../components/PageContainer";
import { useAuth } from "../contexts/AuthContext";
import { UserService, UserProfileService } from "../../api-client";
import type { UserDtoReadable } from "../../api-client/types.gen";

const Settings = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userData, setUserData] = useState<UserDtoReadable | undefined>(undefined);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await UserProfileService.getApiUserProfile();
        setUserData(response.data);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setError("Failed to load user profile.");
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => (prev ? { ...prev, [name]: value } : undefined));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      // Update user text data
      await UserService.putApiUsersProfile({
        body: {
          firstName: userData?.firstName,
          lastName: userData?.lastName,
        },
      });

      // Upload photo
      if (profileImage && profileImage.includes("base64")) {
        const response = await fetch(profileImage);
        const blob = await response.blob();
        const file = new File([blob], "profile-photo.jpg", {
          type: "image/jpeg",
        });

        await UserProfileService.postApiUserProfileProfilePhoto({
          body: {
            file: file,
          },
        });
      }

      setSaveSuccess(true);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveError("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <PageContainer>
        <div className="p-6 text-red-700 dark:text-red-300">{error}</div>
      </PageContainer>
    );
  }

  if (!userData) {
    return (
      <PageContainer>
        <div className="p-6 text-gray-700 dark:text-white">Loading profile...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Settings</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">User Profile</h2>

          {saveSuccess && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              Profile updated successfully!
            </div>
          )}
          {saveError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {saveError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col items-center mb-6">
              <div
                onClick={handleImageClick}
                className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 cursor-pointer mb-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700"
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-400 dark:text-gray-500 text-5xl font-light">
                    {userData?.username?.charAt(0)?.toUpperCase() ?? ""}
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 flex items-center justify-center transition-all duration-200">
                  <span className="text-white opacity-0 hover:opacity-100">Change</span>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload a profile picture</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={userData?.username || ""}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData?.email || ""}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
            </div>

            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={userData?.firstName || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={userData?.lastName || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageContainer>
  );
};

export default Settings;


