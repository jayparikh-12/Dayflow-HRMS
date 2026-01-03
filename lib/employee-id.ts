// Employee ID generation utility
// Format: odoo + first 2 letters of first name + first 2 letters of last name + year + serial number

export function generateEmployeeId(
  firstName: string,
  lastName: string,
  yearOfJoining: number,
  serialNumber: number,
): string {
  const firstNamePart = firstName.slice(0, 2).toLowerCase()
  const lastNamePart = lastName.slice(0, 2).toLowerCase()
  const serialPart = serialNumber.toString().padStart(3, "0")

  return `odoo${firstNamePart}${lastNamePart}${yearOfJoining}${serialPart}`
}

export function getNextSerialNumber(existingEmployees: any[]): number {
  return existingEmployees.length + 1
}
