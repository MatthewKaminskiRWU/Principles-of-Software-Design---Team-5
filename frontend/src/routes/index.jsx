import { createFileRoute } from '@tanstack/react-router'
import TeacherScheduler from '../components/teacherScheduler'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <TeacherScheduler />
}
