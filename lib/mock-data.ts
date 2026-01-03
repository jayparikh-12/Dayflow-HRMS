// Mock data for the HRMS system

export interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  password: string
  role: "admin" | "employee"
  yearOfJoining: number
  profileImage?: string
  phoneNumber?: string
  address?: string
  dateOfBirth?: string
  department?: string
  salary?: number
}

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  leaveType: "sick" | "casual" | "earned" | "maternity" | "paternity"
  startDate: string
  endDate: string
  reason: string
  status: "pending" | "approved" | "rejected"
  appliedOn: string
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  checkIn: string
  checkOut?: string
  status: "present" | "absent" | "half-day" | "on-leave"
  hoursWorked?: number
}

// Mock employees database
export const mockEmployees: Employee[] = [
  {
    id: "1",
    employeeId: "odoojodo2024001",
    firstName: "John",
    lastName: "Doe",
    email: "admin@dayflow.com",
    password: "admin123",
    role: "admin",
    yearOfJoining: 2024,
    department: "Management",
    salary: 85000,
  },
  {
    id: "2",
    employeeId: "odoosasm2024002",
    firstName: "Sarah",
    lastName: "Smith",
    email: "sarah@dayflow.com",
    password: "employee123",
    role: "employee",
    yearOfJoining: 2024,
    department: "Engineering",
    salary: 65000,
  },
]

// Mock leave requests
export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: "1",
    employeeId: "odoosasm2024002",
    employeeName: "Sarah Smith",
    leaveType: "casual",
    startDate: "2026-01-15",
    endDate: "2026-01-17",
    reason: "Personal work",
    status: "pending",
    appliedOn: "2026-01-03",
  },
]

// Mock attendance records
export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: "1",
    employeeId: "odoosasm2024002",
    date: "2026-01-03",
    checkIn: "09:00",
    checkOut: "18:00",
    status: "present",
    hoursWorked: 9,
  },
]
