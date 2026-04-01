import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react"
import CourseScheduler from '../../components/scheduler'

export const Route = createFileRoute('/results/$hash')({
  component: ResultsPage,
})

function ResultsPage() {
  const { hash } = Route.useParams()
  const [event, setEvent] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        // Fetch event metadata
        const eventRes = await fetch(`http://localhost:8000/events/${hash}`)
        if (!eventRes.ok) throw new Error("Failed to fetch event details")
        const eventData = await eventRes.json()
        setEvent(eventData)

        // Fetch availability results
        const resultsRes = await fetch(`http://localhost:8000/events/${hash}/results`)
        if (!resultsRes.ok) throw new Error("Failed to fetch results")
        const resultsData = await resultsRes.json()
        setResults(resultsData)
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [hash])

  if (loading) return <div className="p-8 text-center">Loading results...</div>
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>
  if (!event) return <div className="p-8 text-center">Event not found</div>

  // Find the slot with the most "available + preferred" students
  const maxAvailable = results.reduce((max, slot) => {
    const total = slot.available + slot.preferred
    return total > max ? total : max
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{event.classTitle}</h1>
          <p className="text-gray-600 mb-4">Professor: {event.professor}</p>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span>Most Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 rounded"></div>
              <span>Some Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <span>No Availability</span>
            </div>
          </div>
        </div>

        <CourseScheduler
          slotIds={event.slotIds}
          selectedSlots={new Set()} // Not used for results
          onMouseDown={() => {}} // Read-only
          onMouseEnter={() => {}} // Read-only
          slotResults={results}
          maxAvailable={maxAvailable}
        />
      </div>
    </div>
  )
}
