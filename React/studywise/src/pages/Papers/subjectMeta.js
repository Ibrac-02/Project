import { SUBJECTS } from '../../data/dashboardData'

export const PAPER_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017]

export function getSubjectName(subjectId) {
  return SUBJECTS.find((subject) => subject.id === subjectId)?.name ?? subjectId
}

export function getSubjectColor(subjectId) {
  return SUBJECTS.find((subject) => subject.id === subjectId)?.color ?? '#2563eb'
}
