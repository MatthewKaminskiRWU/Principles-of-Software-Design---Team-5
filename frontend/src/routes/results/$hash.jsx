import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/results/$hash')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/results/$hash"!</div>
}
