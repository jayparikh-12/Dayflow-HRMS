"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { Employee } from "@/lib/mock-data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function EmployeesPage() {
  const { isAdmin, deleteEmployee, user } = useAuth()
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard")
      return
    }

    const storedEmployees = localStorage.getItem("dayflow_employees")
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees))
    }
  }, [isAdmin, router])

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!isAdmin) return null

  const handleDelete = async (employeeId: string) => {
    if (confirm("Are you sure you want to remove this employee? This action cannot be undone.")) {
      const success = await deleteEmployee(employeeId)
      if (success) {
        const storedEmployees = localStorage.getItem("dayflow_employees")
        if (storedEmployees) {
          setEmployees(JSON.parse(storedEmployees))
        }
      } else {
        alert("Cannot delete your own account or employee not found.")
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employee Management</h1>
            <p className="text-muted-foreground mt-1">Manage all employees in your organization</p>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by name or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">{filteredEmployees.length}</span>
              <span>employees</span>
            </div>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-foreground">
                            {employee.firstName[0]}
                            {employee.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{employee.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{employee.employeeId}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{employee.department || "Not Assigned"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={employee.role === "admin" ? "default" : "secondary"}>{employee.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {employee.salary ? `$${employee.salary.toLocaleString()}` : "Not Set"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{employee.yearOfJoining}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(employee.employeeId)}
                        disabled={user?.employeeId === employee.employeeId}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No employees found</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
