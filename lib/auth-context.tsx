"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type Employee, mockEmployees } from "./mock-data"

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  type: string
  startDate: string
  endDate: string
  reason: string
  status: "pending" | "approved" | "rejected"
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  date: string
  status: "present" | "absent"
  checkIn?: string
  checkOut?: string
}

interface AuthContextType {
  user: Employee | null
  employees: Employee[]
  leaveRequests: LeaveRequest[]
  attendanceRecords: AttendanceRecord[]
  login: (email: string, password: string) => Promise<boolean>
  signup: (userData: Partial<Employee>) => Promise<{ success: boolean; employeeId?: string; error?: string }>
  logout: () => void
  deleteEmployee: (employeeId: string) => Promise<boolean>
  updateProfilePicture: (employeeId: string, profileImage: string) => Promise<boolean>
  updateProfile: (employeeId: string, updates: Partial<Employee>) => Promise<boolean>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Employee | null>(null)
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("dayflow_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    // Load employees from localStorage
    const storedEmployees = localStorage.getItem("dayflow_employees")
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees))
    } else {
      localStorage.setItem("dayflow_employees", JSON.stringify(mockEmployees))
    }

    const storedLeaveRequests = localStorage.getItem("dayflow_leave_requests")
    if (storedLeaveRequests) {
      setLeaveRequests(JSON.parse(storedLeaveRequests))
    }

    const storedAttendanceRecords = localStorage.getItem("dayflow_attendance_records")
    if (storedAttendanceRecords) {
      setAttendanceRecords(JSON.parse(storedAttendanceRecords))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    const employee = employees.find((emp) => emp.email === email && emp.password === password)

    if (employee) {
      setUser(employee)
      localStorage.setItem("dayflow_user", JSON.stringify(employee))
      return true
    }
    return false
  }

  const signup = async (userData: Partial<Employee>) => {
    // Check if email already exists
    if (employees.find((emp) => emp.email === userData.email)) {
      return { success: false, error: "Email already exists" }
    }

    // Generate employee ID
    const yearOfJoining = userData.yearOfJoining || new Date().getFullYear()
    const serialNumber = employees.length + 1
    const firstNamePart = (userData.firstName || "").slice(0, 2).toLowerCase()
    const lastNamePart = (userData.lastName || "").slice(0, 2).toLowerCase()
    const employeeId = `odoo${firstNamePart}${lastNamePart}${yearOfJoining}${serialNumber.toString().padStart(3, "0")}`

    const newEmployee: Employee = {
      id: Date.now().toString(),
      employeeId,
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email || "",
      password: userData.password || "",
      role: userData.role || "employee",
      department: userData.department || "",
      position: userData.position || "",
      phoneNumber: userData.phoneNumber || "",
      dateOfBirth: userData.dateOfBirth || "",
      yearOfJoining,
      address: userData.address || "",
      emergencyContact: userData.emergencyContact || "",
      profileImage: userData.profileImage || "",
    }

    const updatedEmployees = [...employees, newEmployee]
    setEmployees(updatedEmployees)
    localStorage.setItem("dayflow_employees", JSON.stringify(updatedEmployees))

    return { success: true, employeeId }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("dayflow_user")
  }

  const deleteEmployee = async (employeeId: string): Promise<boolean> => {
    // Prevent deleting yourself
    if (user?.employeeId === employeeId) {
      return false
    }

    const updatedEmployees = employees.filter((emp) => emp.employeeId !== employeeId)
    setEmployees(updatedEmployees)
    localStorage.setItem("dayflow_employees", JSON.stringify(updatedEmployees))
    return true
  }

  const updateProfilePicture = async (employeeId: string, profileImage: string): Promise<boolean> => {
    const updatedEmployees = employees.map((emp) => (emp.employeeId === employeeId ? { ...emp, profileImage } : emp))

    setEmployees(updatedEmployees)
    localStorage.setItem("dayflow_employees", JSON.stringify(updatedEmployees))

    // Update current user if it's their profile
    if (user?.employeeId === employeeId) {
      const updatedUser = { ...user, profileImage }
      setUser(updatedUser)
      localStorage.setItem("dayflow_user", JSON.stringify(updatedUser))
    }

    return true
  }

  const updateProfile = async (employeeId: string, updates: Partial<Employee>): Promise<boolean> => {
    const updatedEmployees = employees.map((emp) => (emp.employeeId === employeeId ? { ...emp, ...updates } : emp))

    setEmployees(updatedEmployees)
    localStorage.setItem("dayflow_employees", JSON.stringify(updatedEmployees))

    // Update current user if it's their profile
    if (user?.employeeId === employeeId) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem("dayflow_user", JSON.stringify(updatedUser))
    }

    return true
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        employees,
        leaveRequests,
        attendanceRecords,
        login,
        signup,
        logout,
        deleteEmployee,
        updateProfilePicture,
        updateProfile,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
