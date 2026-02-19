import { useState, useEffect, useMemo } from "react";
import { getStudents, bulkMarkAttendance } from "../api/api";

export default function DailyAttendance({ refreshTrigger }) {
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(getTodayStr());
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [statuses, setStatuses] = useState({});

  function getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  const fetchStudents = async () => {
    try {
      const { data } = await getStudents();
      setStudents(data);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [refreshTrigger]);

  const classes = useMemo(
    () =>
      [...new Set(students.map((s) => s.className))].sort((a, b) =>
        b.localeCompare(a, undefined, { numeric: true })
      ),
    [students]
  );
  const sections = useMemo(
    () => [...new Set(students.map((s) => s.section))].sort(),
    [students]
  );

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchClass = !filterClass || s.className === filterClass;
      const matchSec = !filterSection || s.section === filterSection;
      return matchClass && matchSec;
    }).sort((a, b) => a.roll.localeCompare(b.roll, undefined, { numeric: true }));
  }, [students, filterClass, filterSection]);

  const setStatusForStudent = (studentId, status) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status) => {
    const updated = { ...statuses };
    filtered.forEach((s) => {
      updated[s._id] = status;
    });
    setStatuses(updated);
  };

  const handleSave = async () => {
    if (!date) {
      alert("Please select a date first.");
      return;
    }

    const records = [];
    filtered.forEach((s) => {
      const status = statuses[s._id];
      if (status) {
        records.push({ studentId: s._id, status });
      }
    });

    if (records.length === 0) {
      alert("No attendance marked. Please select statuses for students.");
      return;
    }

    try {
      await bulkMarkAttendance(date, records);
      alert("Attendance saved successfully.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save attendance.");
    }
  };

  let statusText = "No date selected.";
  if (date) {
    let scope = "";
    if (filterClass) scope += ` ${filterClass}`;
    if (filterSection) scope += ` Sec ${filterSection}`;
    statusText = `Marking attendance for ${date}${scope ? " –" + scope : ""}.`;
  }

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>
            <i className="fa-solid fa-clipboard-check"></i> Daily Attendance
          </h2>
          <p className="muted">Mark students as Present, Absent, etc.</p>
        </div>
        <div className="field-inline">
          <label>
            <i className="fa-solid fa-calendar-days"></i> Date:
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
            <option value="">All Sections</option>
            {sections.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="section-body">
        <div className="flex-row" style={{ justifyContent: "space-between" }}>
          <div className="flex-row">
            <button className="btn btn-outline btn-small" onClick={() => markAll("P")}>
              <i className="fa-solid fa-user-check"></i> All P
            </button>
            <button className="btn btn-outline btn-small" onClick={() => markAll("A")}>
              <i className="fa-solid fa-user-xmark"></i> All A
            </button>
          </div>
          <div className="muted">{statusText}</div>
        </div>

        <div className="attendance-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Roll</th>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!date ? (
                <tr>
                  <td colSpan="3" className="muted">
                    Please select a date to mark attendance.
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="3" className="muted">
                    No students found for the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((student) => (
                  <tr key={student._id}>
                    <td>{student.roll}</td>
                    <td>{student.name}</td>
                    <td>
                      <select
                        className="attendance-select"
                        value={statuses[student._id] || ""}
                        onChange={(e) =>
                          setStatusForStudent(student._id, e.target.value)
                        }
                      >
                        <option value="">--</option>
                        <option value="P">Present</option>
                        <option value="A">Absent</option>
                        <option value="L">Late</option>
                        <option value="LV">On Leave</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex-row" style={{ justifyContent: "flex-end", gap: "0.4rem" }}>
          <button className="btn btn-primary btn-small" onClick={handleSave}>
            <i className="fa-solid fa-circle-check"></i> Save
          </button>
        </div>
      </div>
    </section>
  );
}
