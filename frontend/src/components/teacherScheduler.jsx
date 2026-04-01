import { useState, useEffect } from "react"
import CourseScheduler from "./scheduler"

export default function TeacherScheduler() {
  const [selectedSlots, setSelectedSlots] = useState(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState(null)
  const [classTitle, setClassTitle] = useState("")
  const [professor, setProfessor] = useState("")
  const [generatedHash, setGeneratedHash] = useState(null)  // store hash after creation

  const toggleSlot = (slotId) => {
    setSelectedSlots((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(slotId)) { newSet.delete(slotId) }
      else { newSet.add(slotId) }
      return newSet
    })
  }

  const handleMouseDown = (slotId) => {
    if (!slotId) return
    setIsDragging(true)
    const mode = selectedSlots.has(slotId) ? "deselect" : "select"
    setDragMode(mode)
    toggleSlot(slotId)
  }

  const handleMouseEnter = (slotId) => {
    if (!isDragging || !slotId) return
    if (dragMode === "select" && !selectedSlots.has(slotId)) { toggleSlot(slotId) }
    else if (dragMode === "deselect" && selectedSlots.has(slotId)) { toggleSlot(slotId) }
  }

  const handleMouseUp = () => { setIsDragging(false); setDragMode(null) }

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp)
    return () => window.removeEventListener("mouseup", handleMouseUp)
  }, [])

  const handleSubmit = async () => {
    if (!classTitle || !professor) { alert("Please enter a class title and professor name."); return }
    if (selectedSlots.size === 0) { alert("Please select at least one time slot."); return }
    try {
      const response = await fetch("http://localhost:8000/events/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classTitle,
          professor,
          slotIds: Array.from(selectedSlots),
        }),
      })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setGeneratedHash(data.hash)  // store the hash to display the link
    } catch (error) {
      console.error("Error creating event:", error)
      alert("Failed to create event. Please try again.")
    }
  }

  const clearAll = () => setSelectedSlots(new Set())

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">CREATE EVENT</h1>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Title</label>
              <input type="text" value={classTitle} onChange={(e) => setClassTitle(e.target.value)}
                placeholder="e.g. SEC220: Intro to Databases"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Professor</label>
              <input type="text" value={professor} onChange={(e) => setProfessor(e.target.value)}
                placeholder="e.g. Dr. White"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* show the shareable link after creation */}
          {generatedHash && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm font-medium text-green-800">Event created! Share this link with students:</p>
              <p className="text-blue-600 font-mono mt-1">
                {window.location.origin}/availability/{generatedHash}
              </p>
            </div>
          )}

          <div className="flex gap-3 items-center">
            <button onClick={handleSubmit} disabled={selectedSlots.size === 0}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
              Create Event
            </button>
            <button onClick={clearAll}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
              Clear All
            </button>
            <div className="ml-auto text-sm text-gray-600">
              Selected: <span className="font-bold text-blue-600">{selectedSlots.size}</span> slots
            </div>
          </div>
        </div>

        <CourseScheduler
          slotIds={null}
          selectedSlots={selectedSlots}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
        />
      </div>
    </div>
  )
}