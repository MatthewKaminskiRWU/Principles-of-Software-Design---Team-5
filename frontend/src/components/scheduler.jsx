export default function CourseScheduler({ slotIds, selectedSlots, onMouseDown, onMouseEnter, slotResults, maxAvailable }) {
  const slotDefinitions = {
    1: { time: "8:00-8:50", days: ["monday"] },
    2: { time: "8:00-8:50", days: ["wednesday"] },
    3: { time: "8:00-8:50", days: ["friday"] },
    4: { time: "9:00-9:50", days: ["monday"] },
    5: { time: "9:00-9:50", days: ["wednesday"] },
    6: { time: "9:00-9:50", days: ["friday"] },
    7: { time: "10:00-10:50", days: ["monday"] },
    8: { time: "10:00-10:50", days: ["wednesday"] },
    9: { time: "10:00-10:50", days: ["friday"] },
    10: { time: "11:00-11:50", days: ["monday"] },
    11: { time: "11:00-11:50", days: ["wednesday"] },
    12: { time: "11:00-11:50", days: ["friday"] },
    13: { time: "12:00-12:50", days: ["monday"] },
    14: { time: "12:00-12:50", days: ["wednesday"] },
    15: { time: "12:00-12:50", days: ["friday"] },
    16: { time: "1:00-1:50", days: ["monday"] },
    17: { time: "1:00-1:50", days: ["wednesday"] },
    18: { time: "1:00-1:50", days: ["friday"] },

    21: { time: "8:00-9:20", days: ["tuesday"] },
    22: { time: "8:00-9:20", days: ["thursday"] },
    23: { time: "9:30-10:50", days: ["tuesday"] },
    24: { time: "9:30-10:50", days: ["thursday"] },
    25: { time: "11:00-12:20", days: ["tuesday"] },
    26: { time: "11:00-12:20", days: ["thursday"] },
    27: { time: "12:30-1:50", days: ["tuesday"] },
    28: { time: "12:30-1:50", days: ["thursday"] },

    31: { time: "2:00-3:20", days: ["monday"] },
    32: { time: "2:00-3:20", days: ["wednesday"] },
    33: { time: "2:00-3:20", days: ["thursday"] },
    34: { time: "3:30-4:50", days: ["monday"] },
    35: { time: "3:30-4:50", days: ["wednesday"] },
    36: { time: "3:30-4:50", days: ["thursday"] },
    37: { time: "5:00-6:20", days: ["monday"] },
    38: { time: "5:00-6:20", days: ["wednesday"] },
    39: { time: "5:00-6:20", days: ["thursday"] },

    41: { time: "2:00-3:20", days: ["tuesday"] },
    42: { time: "2:00-3:20", days: ["friday"] },
    43: { time: "3:30-4:50", days: ["tuesday"] },
    44: { time: "3:30-4:50", days: ["friday"] },
    45: { time: "5:00-6:20", days: ["tuesday"] },
    46: { time: "5:00-6:20", days: ["friday"] },

    51: { time: "6:30-9:30-BR1", days: ["monday"], evening: true },
    52: { time: "6:30-9:30-BR1", days: ["tuesday"], evening: true },
    53: { time: "6:30-9:30-BR1", days: ["wednesday"], evening: true },
    54: { time: "6:30-9:30-BR1", days: ["thursday"], evening: true },

    61: { time: "6:30-9:30-PVD", days: ["monday"], evening: true },
    62: { time: "6:30-9:30-PVD", days: ["tuesday"], evening: true },
    63: { time: "6:30-9:30-PVD", days: ["wednesday"], evening: true },
    64: { time: "6:30-9:30-PVD", days: ["thursday"], evening: true },
  }

  const gridRows = [
    { slots: [1, 21, 2, 22, 3] },
    { slots: [4, null, 5, null, 6] },
    { slots: [null, 23, null, 24, null] },
    { slots: [7, null, 8, null, 9] },
    { slots: [10, 25, 11, 26, 12] },
    { slots: [13, null, 14, null, 15] },
    { slots: [null, 27, null, 28, null] },
    { slots: [16, null, 17, null, 18] },
    { slots: [31, 41, 32, 33, 42] },
    { slots: [34, 43, 35, 36, 44] },
    { slots: [37, 45, 38, 39, 46] },
  ]

  const eveningRows = [
    { label: "6:30-9:30-BRI", slots: [51, 52, 53, 54, null] },
    { label: "6:30-9:30-PVD", slots: [61, 62, 63, 64, null] },
  ]

  const dayLabels = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
  const dayAbbr = ["MON", "TUE", "WED", "THU", "FRI"]

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
      <div className="text-xs font-semibold mt-1">
        {result.available + result.preferred} Students
      </div>
    )
  }

  const renderSlot = (slotId, isAvailable, isSelected, timeLabel, labelOverride = null, dayIndex) => {
    const resultStyle = slotResults ? getResultStyle(slotId) : ""
    const studentCount = getStudentCount(slotId)
    const displayId = labelOverride || (slotId > 100 ? Math.floor(slotId / 10) : slotId)

    // Handle evening label display like old.jsx
    let displayTime = timeLabel
    let campusLabel = null
    if (timeLabel.includes("-BRI") || timeLabel.includes("-BR1")) {
      displayTime = "6:30-9:30"
      campusLabel = "BRI"
    } else if (timeLabel.includes("-PVD")) {
      displayTime = "6:30-9:30"
      campusLabel = "PVD"
    }

    return (
      <div
        className={`w-full h-full flex flex-col items-start justify-start p-2 transition-colors ${
          slotResults ? "" : "cursor-pointer"
        } ${
          slotResults 
            ? resultStyle 
            : (isSelected 
                ? "bg-primary-container text-white active-bevel" 
                : "bg-white hover:bg-surface-dim")
        } ${!isAvailable ? "opacity-30 grayscale pointer-events-none" : ""}`}
        onMouseDown={slotResults ? null : (e) => { e.preventDefault(); onMouseDown(slotId) }}
        onMouseEnter={slotResults ? null : () => onMouseEnter(slotId)}
      >
        <span className={`text-[10px] font-bold ${isSelected ? "text-white" : "text-gray-800"}`}>
          {dayAbbr[dayIndex]} {displayTime}
        </span>
        {campusLabel && (
          <span className={`text-[10px] font-semibold ${isSelected ? "text-blue-100" : "text-gray-500"}`}>
            {campusLabel}
          </span>
        )}
        {studentCount}
        <span className={`text-[10px] mt-auto font-bold ${isSelected ? "text-blue-200" : "text-primary-container/60"}`}>
          #{displayId}
        </span>
      </div>
    )
  }

  return (
    <section className="bg-surface-container-high outset-bevel overflow-hidden select-none">
      <div className="bg-tertiary-fixed-dim p-2 border-b-2 border-outline flex justify-between items-center">
        <span className="text-tertiary font-bold uppercase text-sm">Weekly Schedule Grid</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-white border border-black"></div>
          <div className="w-3 h-3 bg-outline border border-black"></div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs border-2 border-black min-w-[800px]">
          <thead>
            <tr className="bg-tertiary-fixed-dim">
              {dayLabels.map((day) => (
                <th key={day} className="border border-black p-2 text-center font-bold uppercase">
                  {day.slice(0, 3)}
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
                    <td key={dayIndex} className="border border-black p-0 relative" style={{ height: "80px", width: "20%" }}>
                      {slotId ? renderSlot(slotId, isAvailable, isSelected, timeLabel, null, dayIndex) : <div className="w-full h-full bg-surface-dim opacity-20"></div>}
                    </td>
                  )
                })}
              </tr>
            ))}

            <tr>
              <td colSpan="5" className="border border-black bg-surface-variant px-4 py-2 text-center font-black uppercase tracking-wide opacity-80">
                Evening Session
              </td>
            </tr>

            {eveningRows.map((row, rowIndex) => (
              <tr key={`evening-${rowIndex}`}>
                {row.slots.map((slotId, dayIndex) => {
                  const isAvailable = slotId && (!slotIds || slotIds.includes(slotId))
                  const isSelected = isAvailable && selectedSlots.has(slotId)

                  return (
                    <td key={dayIndex} className="border border-black p-0" style={{ height: "80px" }}>
                      {slotId ? renderSlot(slotId, isAvailable, isSelected, row.label, (slotId > 100 ? Math.floor(slotId / 10) : slotId), dayIndex) : <div className="w-full h-full bg-surface-dim opacity-20"></div>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
  
}
