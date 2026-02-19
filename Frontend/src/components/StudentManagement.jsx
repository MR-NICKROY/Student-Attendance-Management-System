import { useState, useEffect, useMemo } from "react";
import { getStudents, deleteStudent as deleteStudentApi } from "../api/api";

export default function StudentManagement({ onEdit, refreshTrigger }) {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");

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
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.roll.toLowerCase().includes(search.toLowerCase());
      const matchClass = !filterClass || s.className === filterClass;
      const matchSec = !filterSection || s.section === filterSection;
      return matchSearch && matchClass && matchSec;
    }).sort((a, b) => a.roll.localeCompare(b.roll, undefined, { numeric: true }));
  }, [students, search, filterClass, filterSection]);

  const sectionCounts = useMemo(() => {
    const counts = {};
    students.forEach((s) => {
      if (!filterClass || s.className === filterClass) {
        counts[s.section] = (counts[s.section] || 0) + 1;
      }
    });
    return counts;
  }, [students, filterClass]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      await deleteStudentApi(id);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete student.");
    }
  };

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>
            <i className="fa-solid fa-users"></i> Student Management
          </h2>
          <p className="muted">
            Search, filter, view, edit, and delete existing students.
          </p>
        </div>
        <div className="flex-row">
          <input
            type="search"
            placeholder="Search by name or roll…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
        <div className="summary-row">
          <div className="summary-item">
            <strong>{students.length}</strong> Students
          </div>
          <div className="summary-item">
            <strong>{classes.length}</strong> Classes
          </div>
          <div className="summary-item">
            <strong>{sections.length}</strong> Sections
          </div>
        </div>
        <div className="summary-row" style={{ marginTop: "0.25rem" }}>
          <div
            className={`summary-item section-chip ${filterSection === "" ? "active" : ""}`}
            onClick={() => setFilterSection("")}
          >
            <strong>All</strong> Sections
          </div>

          {Object.entries(sectionCounts)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([sec, count]) => (
              <div
                key={sec}
                className={`summary-item section-chip ${filterSection === sec ? "active" : ""}`}
                onClick={() => setFilterSection(sec)}
              >
                <strong>{sec}</strong> Section – {count} students
              </div>
            ))}

        </div>

        <div className="divider"></div>

        <div className="attendance-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Roll</th>
                <th>Name</th>
                <th>Class</th>
                <th>Sec</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="muted">
                    No students found.
                  </td>
                </tr>
              ) : (
                filtered.map((student) => (
                  <tr key={student._id}>
                    <td>{student.roll}</td>
                    <td>{student.name}</td>
                    <td>{student.className}</td>
                    <td>{student.section}</td>
                    <td>
                      <button
                        className="btn-icon"
                        title="Edit Student"
                        onClick={() => onEdit(student)}
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button
                        className="btn-icon"
                        title="Delete Student"
                        onClick={() => handleDelete(student._id)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
