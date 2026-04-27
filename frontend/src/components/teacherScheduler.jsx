import { useState, useEffect } from "react";
import CourseScheduler from "./scheduler";

export default function TeacherScheduler() {
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null);
  const [classTitle, setClassTitle] = useState("");
  const [professor, setProfessor] = useState("");
  const [generatedHash, setGeneratedHash] = useState(null);

  const toggleSlot = (slotId) => {
    setSelectedSlots((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(slotId)) {
        newSet.delete(slotId);
      } else {
        newSet.add(slotId);
      }
      return newSet;
    });
  };

  const handleMouseDown = (slotId) => {
    if (!slotId) return;
    setIsDragging(true);
    const mode = selectedSlots.has(slotId) ? "deselect" : "select";
    setDragMode(mode);
    toggleSlot(slotId);
  };

  const handleMouseEnter = (slotId) => {
    if (!isDragging || !slotId) return;
    if (dragMode === "select" && !selectedSlots.has(slotId)) {
      toggleSlot(slotId);
    } else if (dragMode === "deselect" && selectedSlots.has(slotId)) {
      toggleSlot(slotId);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleSubmit = async () => {
    if (!classTitle || !professor) {
      alert("Please enter a class title and professor name.");
      return;
    }
    if (selectedSlots.size === 0) {
      alert("Please select at least one time slot.");
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/events/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classTitle,
          professor,
          slotIds: Array.from(selectedSlots),
        }),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setGeneratedHash(data.hash);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
    }
  };

  const clearAll = () => setSelectedSlots(new Set());

  return (
    <div className="min-h-screen bg-surface-dim p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-surface-container-high outset-bevel p-6 mb-8">
          <h1 className="text-2xl font-bold text-primary-container mb-6 border-b-2 border-primary-container pb-2 uppercase tracking-tight">
            Create Event
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-primary-container mb-1 uppercase">
                Class Title
              </label>
              <input
                className="inset-bevel bg-white px-3 py-2 text-sm focus:outline-none rounded-none"
                placeholder="Software Design"
                type="text"
                value={classTitle}
                onChange={(e) => setClassTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-primary-container mb-1 uppercase">
                Professor
              </label>
              <input
                className="inset-bevel bg-white px-3 py-2 text-sm focus:outline-none rounded-none"
                placeholder="Dr. John Doe"
                type="text"
                value={professor}
                onChange={(e) => setProfessor(e.target.value)}
              />
            </div>
          </div>

          {generatedHash && (
            <div className="inset-bevel p-4 bg-green-50 mb-6">
              <p className="text-xs font-bold text-green-800 uppercase mb-1">
                Event Created! Share Link:
              </p>
              <a 
                href={`${window.location.origin}/availability/${generatedHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:underline font-mono text-sm break-all font-bold block"
              >
                {window.location.origin}/availability/{generatedHash}
              </a>
              <p className="text-xs font-bold text-green-800 uppercase mt-4 mb-1">
                Results Link (Bookmark this!):
              </p>
              <a 
                href={`${window.location.origin}/results/${generatedHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:underline font-mono text-sm break-all font-bold block"
              >
                {window.location.origin}/results/{generatedHash}
              </a>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleSubmit}
              disabled={selectedSlots.size === 0}
              className="px-6 py-2 bg-primary-container text-secondary-container font-bold uppercase outset-bevel active:active-bevel hover:brightness-110 disabled:opacity-50"
            >
              Create Event
            </button>
            <button
              onClick={clearAll}
              className="px-6 py-2 bg-surface-variant text-primary-container font-bold uppercase outset-bevel active:active-bevel"
            >
              Clear All
            </button>
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
  );
}
