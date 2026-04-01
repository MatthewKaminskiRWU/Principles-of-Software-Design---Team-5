export default function CourseScheduler({ slotIds, selectedSlots, onMouseDown, onMouseEnter, slotResults, maxAvailable }) {
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
    120: { time: "6:30-9:30-PVD", days: ["monday"], evening: true },
    13: { time: "6:30-9:30-BR1", days: ["tuesday"], evening: true },
    130: { time: "6:30-9:30-PVD", days: ["tuesday"], evening: true },
    14: { time: "6:30-9:30-BR1", days: ["wednesday"], evening: true },
    140: { time: "6:30-9:30-PVD", days: ["wednesday"], evening: true },
    15: { time: "6:30-9:30-BR1", days: ["thursday"], evening: true },
    150: { time: "6:30-9:30-PVD", days: ["thursday"], evening: true },
  }

  const gridRows = [
    { slots: [1, 21, 1, 21, 1] },
    { slots: [2, null, 2, null, 2] },
    { slots: [null, 22, null, 22, null] },
    { slots: [3, null, 3, null, 3] },
    { slots: [4, 23, 4, 23, 4] },
    { slots: [5, null, 5, null, 5] },
    { slots: [null, 24, null, 24, null] },
    { slots: [6, null, 6, null, 6] },
    { slots: [7, 25, 7, 7, 25] },
    { slots: [8, 26, 8, 8, 26] },
    { slots: [9, 27, 9, 9, 27] },
  ]

  const eveningRows = [
    { label: "6:30-9:30-BRI", slots: [12, 13, 14, 15, null] },
    { label: "6:30-9:30-PVD", slots: [120, 130, 140, 150, null] },
  ]

  const dayLabels = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]

  const getSlotTime = (slotId) => slotDefinitions[slotId]?.time || ""

  const getResultStyle = (slotId) => {
    if (!slotResults) return ""
    const result = slotResults.find(r => r.slotId === slotId)
    if (!result) return "bg-gray-100 opacity-50"

    const total = result.available + result.preferred
    if (total === 0) return "bg-gray-200"
    if (total === maxAvailable && maxAvailable > 0) return "bg-green-600 text-white"

    const ratio = total / maxAvailable
    if (ratio > 0.7) return "bg-green-400"
    if (ratio > 0.4) return "bg-green-200"
    return "bg-green-100"
  }

  const getStudentCount = (slotId) => {
    if (!slotResults) return null
    const result = slotResults.find(r => r.slotId === slotId)
    if (!result) return null
    return (
      <div className="mt-auto text-xs font-semibold">
        {result.available + result.preferred} Students
      </div>
    )
  }

  const renderSlot = (slotId, isAvailable, isSelected, timeLabel, labelOverride = null) => {
    const resultStyle = slotResults ? getResultStyle(slotId) : ""
    const studentCount = getStudentCount(slotId)
    const displayId = labelOverride || (slotId > 100 ? Math.floor(slotId / 10) : slotId)

    return (
      <div
        className={`w-full h-full flex flex-col items-start justify-start p-2 transition-colors ${
          slotResults ? "" : "cursor-pointer"
        } ${
          slotResults ? resultStyle : (isSelected ? "bg-orange-300 text-white" : "bg-white hover:bg-gray-300")
        } ${!isAvailable ? "opacity-30 grayscale pointer-events-none" : ""}`}
        onMouseDown={slotResults ? null : (e) => { e.preventDefault(); onMouseDown(slotId) }}
        onMouseEnter={slotResults ? null : () => onMouseEnter(slotId)}
      >
        <span className="text-lg font-bold">{displayId}</span>
        <span className="text-xs mt-1">{timeLabel}</span>
        {studentCount}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden select-none">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {dayLabels.map((day) => (
                <th key={day} className="border-2 border-black bg-white px-4 py-3 text-center font-bold text-sm">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gridRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.slots.map((slotId, dayIndex) => {
                  const isAvailable = slotId && (!slotIds || slotIds.includes(slotId))
                  const isSelected = isAvailable && selectedSlots.has(slotId)
                  const timeLabel = slotId ? getSlotTime(slotId) : ""

                  return (
                    <td key={dayIndex} className="border-2 border-black p-0 relative" style={{ height: "80px" }}>
                      {slotId ? renderSlot(slotId, isAvailable, isSelected, timeLabel) : <div className="w-full h-full bg-white"></div>}
                    </td>
                  )
                })}
              </tr>
            ))}

            <tr>
              <td colSpan="5" className="border-2 border-black bg-gray-300 px-4 py-2 text-center font-bold">
                EVENING COURSES
              </td>
            </tr>

            {eveningRows.map((row, rowIndex) => (
              <tr key={`evening-${rowIndex}`}>
                {row.slots.map((slotId, dayIndex) => {
                  const isAvailable = slotId && (!slotIds || slotIds.includes(slotId))
                  const isSelected = isAvailable && selectedSlots.has(slotId)

                  return (
                    <td key={dayIndex} className="border-2 border-black p-0" style={{ height: "80px" }}>
                      {slotId ? renderSlot(slotId, isAvailable, isSelected, row.label, slotId > 100 ? Math.floor(slotId / 10) : slotId) : <div className="w-full h-full bg-white"></div>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}