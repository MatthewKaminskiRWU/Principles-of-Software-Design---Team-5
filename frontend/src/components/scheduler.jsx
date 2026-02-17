import { useState, useEffect } from "react";

export default function CourseScheduler() {
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // I took these slot definitions directly from the image ruocco provided, however there are
  // missing class blocks by the look of it
  // its also kinda odd that classes for providence campus are provided (we might want to do away with them)
  const slotDefinitions = {
    1: { time: "8:00-8:50", days: ["monday", "wednesday", "friday"] },
    2: { time: "9:00-9:50", days: ["monday", "wednesday", "friday"] },
    3: { time: "10:00-10:50", days: ["monday", "wednesday", "friday"] },
    4: { time: "11:00-11:50", days: ["monday", "wednesday", "friday"] },
    5: { time: "12:00-12:50", days: ["monday", "wednesday", "friday"] },
    6: { time: "1:00-1:50", days: ["monday", "wednesday", "friday"] },
    7: { time: "2:00-3:20", days: ["monday", "wednesday", "thursday"] },
    8: { time: "3:30-4:50", days: ["monday", "wednesday", "thursday"] },
    9: { time: "5:00-6:20", days: ["monday", "wednesday", "thursday"] },
    21: { time: "8:00-9:20", days: ["tuesday", "thursday"] },
    22: { time: "9:30-10:50", days: ["tuesday", "thursday"] },
    23: { time: "11:00-12:20", days: ["tuesday", "thursday"] },
    24: { time: "12:30-1:50", days: ["tuesday", "thursday"] },
    25: { time: "2:00-3:20", days: ["tuesday", "friday"] },
    26: { time: "3:30-4:50", days: ["tuesday", "friday"] },
    27: { time: "5:00-6:20", days: ["tuesday", "friday"] },
    12: { time: "6:30-9:30-BR1", days: ["monday"], evening: true },
    "12-pvd": { time: "6:30-9:30-PVD", days: ["monday"], evening: true },
    13: { time: "6:30-9:30-BR1", days: ["tuesday"], evening: true },
    "13-pvd": { time: "6:30-9:30-PVD", days: ["tuesday"], evening: true },
    14: { time: "6:30-9:30-BR1", days: ["wednesday"], evening: true },
    "14-pvd": { time: "6:30-9:30-PVD", days: ["wednesday"], evening: true },
    15: { time: "6:30-9:30-BR1", days: ["thursday"], evening: true },
    "15-pvd": { time: "6:30-9:30-PVD", days: ["thursday"], evening: true },
  };

  // this builds the table based on when the classes meet
  const gridRows = [
    // Row 1: 8:00 slots
    { slots: [1, 21, 1, 21, 1] },
    // Row 2: 9:00 slots (M/W/F only)
    { slots: [2, null, 2, null, 2] },
    // Row 3: 9:30 slots (T/Th only)
    { slots: [null, 22, null, 22, null] },
    // Row 4: 10:00 slots (M/W/F only)
    { slots: [3, null, 3, null, 3] },
    // Row 5: 11:00 slots
    { slots: [4, 23, 4, 23, 4] },
    // Row 6: 12:00 slots (M/W/F only)
    { slots: [5, null, 5, null, 5] },
    // Row 7: 12:30 slots (T/Th only)
    { slots: [null, 24, null, 24, null] },
    // Row 8: 1:00 slots (M/W/F only)
    { slots: [6, null, 6, null, 6] },
    // Row 9: 2:00 slots
    { slots: [7, 25, 7, 7, 25] },
    // Row 10: 3:30 slots
    { slots: [8, 26, 8, 8, 26] },
    // Row 11: 5:00 slots
    { slots: [9, 27, 9, 9, 27] },
  ];

  const eveningRows = [
    { label: "6:30-9:30-BRI", slots: [12, 13, 14, 15, null] },
    {
      label: "6:30-9:30-PVD",
      slots: ["12-pvd", "13-pvd", "14-pvd", "15-pvd", null],
    },
  ];

  const dayLabels = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

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

  const generateJSON = () => {
    const availability = Array.from(selectedSlots).map((slotId) => ({
      slotId:
        typeof slotId === "string" && slotId.includes("-")
          ? parseInt(slotId.split("-")[0])
          : slotId,
      status: "available",
    }));

    // this is based on the JSON schema we defined earlier. 
    return JSON.stringify(
      {
        version: "1.0",
        eventHash: "abc123xyz",
        user: {
          name: userName || "Student Name",
          email: userEmail || "student@email.edu",
        },
        availability: availability,
        submittedAt: new Date().toISOString(),
      },
      null,
      2,
    );
  };

  const downloadJSON = () => {
    const json = generateJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "availability.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setSelectedSlots(new Set());
  };

  const getSlotTime = (slotId) => {
    return slotDefinitions[slotId]?.time || "";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            COURSE SCHEDULING ROUGH DRAFT
          </h1>

          {/* User Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Student Name"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="fllllxxx@g.rwu.edu"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 items-center">
            <button
              onClick={downloadJSON}
              disabled={selectedSlots.size === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Download JSON
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Clear All
            </button>
            <div className="ml-auto text-sm text-gray-600">
              Selected:{" "}
              <span className="font-bold text-blue-600">
                {selectedSlots.size}
              </span>{" "}
              slots
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="bg-white rounded-lg shadow overflow-hidden select-none">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {dayLabels.map((day) => (
                    <th
                      key={day}
                      className="border-2 border-black bg-white px-4 py-3 text-center font-bold text-sm"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Regular Schedule Rows */}
                {gridRows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.slots.map((slotId, dayIndex) => {
                      const isSelected = slotId && selectedSlots.has(slotId);
                      const timeLabel = slotId ? getSlotTime(slotId) : "";

                      return (
                        <td
                          key={dayIndex}
                          className="border-2 border-black p-0 relative"
                          style={{ height: "80px" }}
                        >
                          {slotId ? (
                            <div
                              className={`
                                w-full h-full flex flex-col items-start justify-start p-2
                                cursor-pointer transition-colors
                                ${
                                  isSelected
                                    ? "bg-orange-300 text-white"
                                    : "bg-white hover:bg-gray-300"
                                }
                              `}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleMouseDown(slotId);
                              }}
                              onMouseEnter={() => handleMouseEnter(slotId)}
                            >
                              <span className="text-lg font-bold">
                                {slotId}
                              </span>
                              <span className="text-xs mt-1">{timeLabel}</span>
                            </div>
                          ) : (
                            <div className="w-full h-full bg-white"></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Evening Courses Header */}
                <tr>
                  <td
                    colSpan="5"
                    className="border-2 border-black bg-gray-300 px-4 py-2 text-center font-bold"
                  >
                    EVENING COURSES
                  </td>
                </tr>

                {/* Evening Rows */}
                {eveningRows.map((row, rowIndex) => (
                  <tr key={`evening-${rowIndex}`}>
                    {row.slots.map((slotId, dayIndex) => {
                      const isSelected = slotId && selectedSlots.has(slotId);

                      return (
                        <td
                          key={dayIndex}
                          className="border-2 border-black p-0"
                          style={{ height: "80px" }}
                        >
                          {slotId ? (
                            <div
                              className={`
                                w-full h-full flex flex-col items-start justify-start p-2
                                cursor-pointer transition-colors
                                ${
                                  isSelected
                                    ? "bg-orange-300 text-white"
                                    : "bg-white hover:bg-gray-300"
                                }
                              `}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleMouseDown(slotId);
                              }}
                              onMouseEnter={() => handleMouseEnter(slotId)}
                            >
                              <span className="text-lg font-bold">
                                {typeof slotId === "string"
                                  ? slotId.split("-")[0]
                                  : slotId}
                              </span>
                              <span className="text-xs mt-1">{row.label}</span>
                            </div>
                          ) : (
                            <div className="w-full h-full bg-white"></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions */}
        {/* We will probably want to
         include some sort of instructions here*/}
 

        {/* JSON Preview */}
        {selectedSlots.size > 0 && (
          <div className="mt-6 bg-gray-900 rounded-lg p-4">
            <h3 className="text-green-400 font-semibold mb-2">JSON Preview:</h3>
            <pre className="text-green-400 text-xs overflow-auto max-h-96">
              {generateJSON()}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
