"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import type { LeaveRequest } from "@/lib/mock-data"

export default function TimeOffPage() {
  const { user } = useAuth()
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    leaveType: "casual" as "sick" | "casual" | "earned" | "maternity" | "paternity",
    startDate: "",
    endDate: "",
    reason: "",
  })

  useEffect(() => {
    const storedLeaves = localStorage.getItem("dayflow_leave_requests")
    if (storedLeaves) {
      const allLeaves = JSON.parse(storedLeaves)
      setLeaveRequests(allLeaves.filter((leave: LeaveRequest) => leave.employeeId === user?.employeeId))
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    const newRequest: LeaveRequest = {
      id: Date.now().toString(),
      employeeId: user.employeeId,
      employeeName: `${user.firstName} ${user.lastName}`,
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      status: "pending",
      appliedOn: new Date().toISOString().split("T")[0],
    }

    const storedLeaves = localStorage.getItem("dayflow_leave_requests")
    const allLeaves = storedLeaves ? JSON.parse(storedLeaves) : []
    const updatedLeaves = [...allLeaves, newRequest]

    localStorage.setItem("dayflow_leave_requests", JSON.stringify(updatedLeaves))
    setLeaveRequests(updatedLeaves.filter((leave: LeaveRequest) => leave.employeeId === user.employeeId))

    setFormData({
      leaveType: "casual",
      startDate: "",
      endDate: "",
      reason: "",
    })
    setIsDialogOpen(false)
  }

  if (!user) return null

  const pendingCount = leaveRequests.filter((req) => req.status === "pending").length
  const approvedCount = leaveRequests.filter((req) => req.status === "approved").length
  const rejectedCount = leaveRequests.filter((req) => req.status === "rejected").length

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Time Off Requests</h1>
            <p className="text-muted-foreground mt-1">Manage your leave applications</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Request Time Off</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Request Time Off</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="leaveType">Leave Type</Label>
                  <Select
                    value={formData.leaveType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, leaveType: value as typeof formData.leaveType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="earned">Earned Leave</SelectItem>
                      <SelectItem value="maternity">Maternity Leave</SelectItem>
                      <SelectItem value="paternity">Paternity Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please provide a reason for your leave request..."
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit Request</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-warning mt-2">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-3xl font-bold text-success mt-2">{approvedCount}</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-3xl font-bold text-danger mt-2">{rejectedCount}</p>
              </div>
              <div className="w-12 h-12 bg-danger/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">My Leave History</h2>
          <div className="space-y-3">
            {leaveRequests
              .sort((a, b) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime())
              .map((leave) => (
                <div key={leave.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground capitalize">{leave.leaveType} Leave</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            leave.status === "approved"
                              ? "bg-success/20 text-success"
                              : leave.status === "rejected"
                                ? "bg-danger/20 text-danger"
                                : "bg-warning/20 text-warning"
                          }`}
                        >
                          {leave.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            {leave.startDate} to {leave.endDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>Applied on {leave.appliedOn}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{leave.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            {leaveRequests.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-muted-foreground mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-muted-foreground">No leave requests yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Request Time Off" to submit your first request
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
