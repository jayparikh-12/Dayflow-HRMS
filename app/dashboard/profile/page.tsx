"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Edit, X, Check } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export default function ProfilePage() {
  const { user, updateProfilePicture, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "")
  const [address, setAddress] = useState(user?.address || "")
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || "")
  const [department, setDepartment] = useState(user?.department || "")
  const [salary, setSalary] = useState(user?.salary?.toString() || "")

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && user) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        updateProfilePicture(user.employeeId, base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (user) {
      await updateProfile(user.employeeId, {
        phoneNumber,
        address,
        dateOfBirth,
        department,
        salary: salary ? Number.parseFloat(salary) : undefined,
      })
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setPhoneNumber(user?.phoneNumber || "")
    setAddress(user?.address || "")
    setDateOfBirth(user?.dateOfBirth || "")
    setDepartment(user?.department || "")
    setSalary(user?.salary?.toString() || "")
    setIsEditing(false)
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">View and manage your personal information</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} size="sm">
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-1">
            <div className="flex flex-col items-center text-center">
              <div className="relative group mb-4">
                <Avatar className="w-24 h-24">
                  {user.profileImage && (
                    <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.firstName} />
                  )}
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
              <h2 className="text-xl font-bold text-foreground">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-xs font-mono text-muted-foreground mt-2 bg-muted px-3 py-1 rounded">
                {user.employeeId}
              </p>
              <div className="mt-6 w-full space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Role</span>
                  <span className="text-sm font-medium text-foreground capitalize">{user.role}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Joined</span>
                  <span className="text-sm font-medium text-foreground">{user.yearOfJoining}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Department</span>
                  <span className="text-sm font-medium text-foreground">{user.department || "Not Assigned"}</span>
                </div>
                {user.salary && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Salary</span>
                    <span className="text-sm font-medium text-foreground">${user.salary.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input value={user.firstName} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input value={user.lastName} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input value={user.email} disabled />
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  type="text"
                  placeholder="Enter your department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label>Salary</Label>
                <Input
                  type="number"
                  placeholder="Enter your salary"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea
                  placeholder="Enter your address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
