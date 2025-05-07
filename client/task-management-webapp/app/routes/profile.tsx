"use client"

import type React from "react"

import { useState } from "react"
import { AppLayout } from "../components/layout/app-layout"
import { Button } from "../components/ui/button"
import { Form, FormField, FormLabel } from "../components/ui/form"
import { Input } from "../components/ui/input"
import { useAuth } from "../context/auth-context"

export default function Profile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Note: Backend endpoint for updating user profile would need to be implemented
    // This is a placeholder for future implementation

    alert("Profile update functionality would be implemented here")
    setIsEditing(false)
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">User Profile</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</h2>
                <p className="mt-1 text-lg text-gray-900 dark:text-white">{user?.name}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h2>
                <p className="mt-1 text-lg text-gray-900 dark:text-white">{user?.email}</p>
              </div>

              <div className="pt-4">
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </div>
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <FormField>
                <FormLabel htmlFor="name">Name</FormLabel>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </FormField>

              <FormField>
                <FormLabel htmlFor="email">Email</FormLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </FormField>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </Form>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
