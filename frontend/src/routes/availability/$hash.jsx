import { createFileRoute, useParams } from '@tanstack/react-router'
import CourseScheduler from '../../components/scheduler'

export const Route = createFileRoute('/availability/$hash')({
    loader: ({ params }) => fetch(`http://localhost:8000/events/${params.hash}`),
    component: RouteComponent,
})
// we are passing in params as a prop and using it to fetch the specific class availability

function RouteComponent() {
    const {hash} = Route.useParams({ from: '/availability/$hash'})
    const event = Route.useLoaderData()
    return <CourseScheduler hash={hash} event={event.slotIds} /> 
}