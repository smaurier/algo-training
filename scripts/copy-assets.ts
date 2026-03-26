import { cpSync, mkdirSync } from 'node:fs'

mkdirSync('public/quizzes', { recursive: true })
mkdirSync('public/visualizations', { recursive: true })

const htmlFilter = (file: string) => file.endsWith('.html') || !file.includes('.')

cpSync('quizzes', 'public/quizzes', { recursive: true, filter: htmlFilter })
cpSync('visualizations', 'public/visualizations', { recursive: true, filter: htmlFilter })
