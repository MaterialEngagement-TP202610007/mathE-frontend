export interface AcademicGrade {
  id: number
  name: string
  level: "primaria" | "secundaria"
  order: number
}

export const ACADEMIC_GRADES: AcademicGrade[] = [
  { id: 1, name: "1° de primaria", level: "primaria", order: 1 },
  { id: 2, name: "2° de primaria", level: "primaria", order: 2 },
  { id: 3, name: "3° de primaria", level: "primaria", order: 3 },
  { id: 4, name: "4° de primaria", level: "primaria", order: 4 },
  { id: 5, name: "5° de primaria", level: "primaria", order: 5 },
  { id: 6, name: "6° de primaria", level: "primaria", order: 6 },
  { id: 7, name: "1° de secundaria", level: "secundaria", order: 7 },
  { id: 8, name: "2° de secundaria", level: "secundaria", order: 8 },
  { id: 9, name: "3° de secundaria", level: "secundaria", order: 9 },
  { id: 10, name: "4° de secundaria", level: "secundaria", order: 10 },
  { id: 11, name: "5° de secundaria", level: "secundaria", order: 11 },
]
