"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Clock } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function DashboardPage() {
  const { user, employees, leaveRequests, attendanceRecords } = useAuth()

  if (!user) return null

  const isAdmin = user.role === "admin"

  // Admin stats
  const totalEmployees = employees.length
  const pendingLeaves = leaveRequests.filter((req) => req.status === "pending").length
  const todayAttendance = attendanceRecords.filter(
    (record) => record.date === new Date().toISOString().split("T")[0] && record.status === "present",
  ).length

  // Employee stats
  const myLeaveRequests = leaveRequests.filter((req) => req.employeeId === user.id)
  const myPendingLeaves = myLeaveRequests.filter((req) => req.status === "pending").length
  const myApprovedLeaves = myLeaveRequests.filter((req) => req.status === "approved").length

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.firstName}!</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? "Manage your organization efficiently" : "Track your attendance and leave requests"}
          </p>
        </div>

        {isAdmin ? (
          <>
            {/* Admin Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalEmployees}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Leave Requests</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingLeaves}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {todayAttendance}/{totalEmployees}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Employees */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Employees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employees.slice(0, 5).map((employee) => (
                    <div key={employee.id} className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {employee.firstName[0]}
                          {employee.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">{employee.role}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Employee Stats */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Leave Requests</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{myPendingLeaves}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Approved Leaves</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{myApprovedLeaves}</div>
                </CardContent>
              </Card>
            </div>

            {/* My Leave History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myLeaveRequests.slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{request.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.startDate} to {request.endDate}
                        </p>
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          request.status === "approved"
                            ? "text-green-600"
                            : request.status === "rejected"
                              ? "text-red-600"
                              : "text-yellow-600"
                        }`}
                      >
                        {request.status}
                      </div>
                    </div>
                  ))}
                  {myLeaveRequests.length === 0 && (
                    <p className="text-sm text-muted-foreground">No leave requests yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
