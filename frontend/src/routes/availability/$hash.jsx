import { createFileRoute, useParams } from '@tanstack/react-router'
import CourseScheduler from '../../components/scheduler'

export const Route = createFileRoute('/availability/$hash')({
    loader: async ({ params }) => {
        const response = await fetch(`http://localhost:8000/events/${params.hash}`)
        if (!response.ok) {
            throw new Error('Event not found')
        }
        return response.json()
    },
    errorComponent: ({ error }) => (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-red-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="Refactor: 12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Event Not Found</h2>
                <p className="text-gray-600 mb-6">
                    This scheduling link may be invalid, expired, or the event has been removed.
                </p>
                <a 
                    href="/" 
                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    Return Home
                </a>
            </div>
        </div>
    ),
    component: RouteComponent,
})
// we are passing in params as a prop and using it to fetch the specific class availability

function RouteComponent() {
    const {hash} = Route.useParams({ from: '/availability/$hash'})
    const event = Route.useLoaderData()
    return <CourseScheduler hash={hash} slotIds={event.slotIds} /> 
}