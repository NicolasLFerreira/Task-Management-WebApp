"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import PageContainer from "../components/PageContainer"
import { useAuth } from "../contexts/AuthContext"
import { UserService, UserProfileService } from "../../api-client"
import type { UserDtoReadable } from "../../api-client/types.gen"
import { Camera, User, Lock, SettingsIcon, Eye, EyeOff, Check, X, Sliders, Bell, Globe } from "lucide-react"
import { PasswordStrengthMeter } from "../components/Auth/PasswordStrengthMeter"

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const Settings = () => {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State management
  const [activeTab, setActiveTab] = useState("profile")
  const [userData, setUserData] = useState<UserDtoReadable | undefined>(undefined)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Loading and message states
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPhotoLoading, setIsPhotoLoading] = useState(false)

  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await UserProfileService.getApiUserProfile()
        setUserData(response.data)

        // Load existing profile photo if available
        if (response.data?.profilePhotoPath) {
          try {
            setIsPhotoLoading(true)
            const photoResponse = await UserProfileService.getApiUserProfileProfilePhoto({
              responseType: "blob", // Ensure we get a blob response
            })

            if (photoResponse.data) {
              // Create URL from the blob response
              const imageUrl = URL.createObjectURL(photoResponse.data as Blob)
              setProfileImage(imageUrl)
            }
          } catch (error) {
            console.error("Error loading profile photo:", error)
          } finally {
            setIsPhotoLoading(false)
          }
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err)
        setError("Failed to load user profile.")
      }
    }

    fetchUserProfile()
  }, [user])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserData((prev) => (prev ? { ...prev, [name]: value } : undefined))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setSaveError("Please select a valid image file.")
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setSaveError("Image size must be less than 5MB.")
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSaveSuccess(false)
    setSaveError(null)

    try {
      // Update user text data
      await UserService.putApiUsersProfile({
        body: {
          id: userData?.id,
          username: userData?.username,
          firstName: userData?.firstName,
          lastName: userData?.lastName,
        },
      })
      const refreshed = await UserProfileService.getApiUserProfile();
setUserData(refreshed.data);

      // Upload photo if changed
      if (profileImage && profileImage.includes("base64")) {
        try {
          const response = await fetch(profileImage)
          const blob = await response.blob()
          const file = new File([blob], "profile-photo.jpg", {
            type: "image/jpeg",
          })
      
          await UserProfileService.postApiUserProfileProfilePhoto({
            body: {
              file: file,
            },
          })

          const photoResponse = await UserProfileService.getApiUserProfileProfilePhoto({ responseType: "blob" })
          if (photoResponse.data) {
            const imageUrl = URL.createObjectURL(photoResponse.data as Blob)
            setProfileImage(imageUrl)
          }
      
        } catch (uploadError) {
          console.error("Error uploading profile photo:", uploadError)
          setSaveError("Failed to upload profile photo. Please try again.")
        }
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Error updating profile:", error)
      setSaveError("Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPasswordLoading(true)
    setPasswordSuccess(false)
    setPasswordError(null)

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.")
      setIsPasswordLoading(false)
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.")
      setIsPasswordLoading(false)
      return
    }

    if (passwordStrength < 3) {
      setPasswordError("Please choose a stronger password.")
      setIsPasswordLoading(false)
      return
    }

    try {
      await UserService.putApiUsersPassword({
        body: {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
      })

      setPasswordSuccess(true)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (error: unknown) {
      console.error("Error changing password:", error)
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } }
        if (axiosError.response?.status === 400) {
          setPasswordError("Current password is incorrect.")
        } else {
          setPasswordError("Failed to change password. Please try again.")
        }
      } else {
        setPasswordError("Failed to change password. Please try again.")
      }
    } finally {
      setIsPasswordLoading(false)
    }
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "preferences", label: "Preferences", icon: SettingsIcon },
  ]

  if (error) {
    return (
      <PageContainer>
        <div className="p-6 text-red-700 dark:text-red-300">{error}</div>
      </PageContainer>
    )
  }

  if (!userData) {
    return (
      <PageContainer>
        <div className="p-6 text-gray-700 dark:text-white">Loading profile...</div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Account Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Manage your personal information, security settings, and preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2.5 px-5 rounded-md font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 relative">
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                <div className="relative group">
                  <div
                    onClick={handleImageClick}
                    className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 cursor-pointer bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg"
                  >
                    {isPhotoLoading ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 animate-pulse">
                        <span className="sr-only">Loading...</span>
                      </div>
                    ) : profileImage ? (
                      <img
                        src={profileImage || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Image failed to load")
                          e.currentTarget.src = "/placeholder.svg"
                          setProfileImage(null)
                        }}
                      />
                    ) : (
                      <div className="text-white text-5xl font-semibold">
                        {userData?.username?.charAt(0)?.toUpperCase() ?? ""}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-200">
                      <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            <div className="pt-20 px-8 pb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                Profile Information
              </h2>

              {saveSuccess && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-2 animate-fadeIn">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-green-800 dark:text-green-200">Profile updated successfully!</span>
                </div>
              )}

              {saveError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2 animate-fadeIn">
                  <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-red-800 dark:text-red-200">{saveError}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit}>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center mb-8">
                  Click on the avatar to upload a profile picture
                  <br />
                  <span className="text-xs">JPG, PNG or GIF (max 5MB)</span>
                </p>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={userData?.username || ""}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                      placeholder="Enter your username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={userData?.email || ""}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:bg-gray-700 dark:text-white bg-gray-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={userData?.firstName || ""}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={userData?.lastName || ""}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Lock className="w-6 h-6 mr-2 text-blue-500" />
              Security Settings
            </h2>

            {passwordSuccess && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-2 animate-fadeIn">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-200">Password changed successfully!</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2 animate-fadeIn">
                <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-red-800 dark:text-red-200">{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="max-w-md mx-auto">
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {passwordData.newPassword && (
                  <PasswordStrengthMeter password={passwordData.newPassword} onScoreChange={setPasswordStrength} />
                )}

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isPasswordLoading}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
                >
                  {isPasswordLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Changing Password...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Change Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <SettingsIcon className="w-6 h-6 mr-2 text-blue-500" />
              Preferences
            </h2>

            <div className="max-w-3xl mx-auto">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-blue-100 dark:bg-blue-800/50 p-3 rounded-full">
                    <Sliders className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">More Settings Coming Soon</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    We're working on additional preference options to customize your experience. Stay tuned for updates!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                  <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex flex-col items-center text-center">
                    <Bell className="w-8 h-8 text-blue-500 mb-3" />
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Notification Settings</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Control how and when you receive notifications
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex flex-col items-center text-center">
                    <Globe className="w-8 h-8 text-blue-500 mb-3" />
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Language & Region</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Set your preferred language and regional formats
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex flex-col items-center text-center">
                    <User className="w-8 h-8 text-blue-500 mb-3" />
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Accessibility</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Customize your experience for better accessibility
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default Settings
