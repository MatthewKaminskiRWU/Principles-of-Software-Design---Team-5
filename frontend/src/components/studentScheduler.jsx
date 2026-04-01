import { useState, useEffect } from "react"
import CourseScheduler from "./scheduler"

export default function StudentScheduler({ hash, slotIds, classTitle, professor }) {
  const [selectedSlots, setSelectedSlots] = useState(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState(null)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")

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

  const getSubmissionData = () => ({
    version: "1.0",
    eventHash: hash,
    user: { name: userName, email: userEmail },
    availability: Array.from(selectedSlots).map((slotId) => ({ slotId, status: "available" })),
    submittedAt: new Date().toISOString(),
  })

  const generateJSON = () => JSON.stringify(getSubmissionData(), null, 2)

  const handleSubmit = async () => {
    if (!userName || !userEmail) { alert("Please enter your name and email before submitting."); return }
    try {
      const response = await fetch("http://localhost:8000/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getSubmissionData()),
      })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      alert("Availability submitted successfully!")
      setSelectedSlots(new Set())
    } catch (error) {
      console.error("Error submitting availability:", error)
      alert("Failed to submit availability. Please try again.")
    }
  }

  const clearAll = () => setSelectedSlots(new Set())

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{classTitle || "COURSE SCHEDULING"}</h1>
              {professor && <p className="text-gray-600">Professor: {professor}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)}
                placeholder="Student Name"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)}
                placeholder="fllllxxx@g.rwu.edu"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={handleSubmit} disabled={selectedSlots.size === 0}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
              Submit
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
          slotIds={slotIds}
          selectedSlots={selectedSlots}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
        />

        {selectedSlots.size > 0 && (
          <div className="mt-6 bg-gray-900 rounded-lg p-4">
            <h3 className="text-green-400 font-semibold mb-2">JSON Preview:</h3>
            <pre className="text-green-400 text-xs overflow-auto max-h-96">{generateJSON()}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
