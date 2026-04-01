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
    <div className="min-h-screen bg-surface-dim p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-surface-container-high outset-bevel p-6 mb-8">
          <div className="flex justify-between items-start mb-6 border-b-2 border-primary-container pb-2">
            <div>
              <h1 className="text-2xl font-bold text-primary-container uppercase tracking-tight">{classTitle || "COURSE SCHEDULING"}</h1>
              {professor && <p className="text-sm font-bold opacity-70">Professor: {professor}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-primary-container mb-1 uppercase">Name</label>
              <input 
                type="text" 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Student Name"
                className="inset-bevel bg-white px-3 py-2 text-sm focus:outline-none rounded-none" 
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-primary-container mb-1 uppercase">Email</label>
              <input 
                type="email" 
                value={userEmail} 
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="fllllxxx@g.rwu.edu"
                className="inset-bevel bg-white px-3 py-2 text-sm focus:outline-none rounded-none" 
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleSubmit} 
              disabled={selectedSlots.size === 0}
              className="px-6 py-2 bg-primary-container text-secondary-container font-bold uppercase outset-bevel active:active-bevel hover:brightness-110 disabled:opacity-50"
            >
              Submit
            </button>
            <button 
              onClick={clearAll}
              className="px-6 py-2 bg-surface-variant text-primary-container font-bold uppercase outset-bevel active:active-bevel"
            >
              Clear All
            </button>
            <div className="ml-auto text-xs font-bold text-primary-container flex items-center bg-white px-3 inset-bevel">
              SELECTED: {selectedSlots.size}
            </div>
          </div>
        </div>

        <CourseScheduler
          slotIds={slotIds}
          selectedSlots={selectedSlots}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
        />
      </div>
    </div>
  )
}
