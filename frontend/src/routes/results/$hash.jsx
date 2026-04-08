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

  // Find the slot with the most available students
  const maxAvailable = results.reduce((max, slot) => {
    const total = slot.available + slot.preferred
    return total > max ? total : max
  }, 0)

  return (
    <div className="min-h-screen bg-surface-dim p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-surface-container-high outset-bevel p-6 mb-8">
          <div className="flex justify-between items-start mb-6 border-b-2 border-primary-container pb-2">
            <div>
              <h1 className="text-2xl font-bold text-primary-container uppercase tracking-tight">
                {event.classTitle}
              </h1>
              <p className="text-sm font-bold opacity-70 uppercase font-mono">
                Professor: {event.professor}
              </p>
            </div>
            <div className="text-right border-l border-primary-container/20 pl-4">
              <p className="text-xs font-bold text-primary-container uppercase tracking-wider animate-[pulse_3s_ease-in-out_infinite]">
                [ BOOKMARK THIS PAGE ]
              </p>
              <p className="text-[10px] text-primary-container font-mono uppercase opacity-80 mt-1">
                Save this URL to check for updates
              </p>
            </div>
          </div>
          
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
