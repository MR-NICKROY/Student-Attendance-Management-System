import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getStudents,
  getStudentReport,
  getOverallReport,
} from "../api/api";

export default function Reports({ refreshTrigger }) {
  const [students, setStudents] = useState([]);
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [studentReport, setStudentReport] = useState(null);
  const [overallReport, setOverallReport] = useState(null);
  const [classReport, setClassReport] = useState([]);

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

  // Fetch individual student report
  const fetchStudentReport = useCallback(async () => {
    if (!selectedStudentId) {
      setStudentReport(null);
      return;
    }
    try {
      const { data } = await getStudentReport(selectedStudentId);
      setStudentReport(data);
    } catch (err) {
      console.error("Failed to fetch student report:", err);
      setStudentReport(null);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    fetchStudentReport();
  }, [fetchStudentReport, refreshTrigger]);

  // Fetch overall report
  const fetchOverallReport = useCallback(async () => {
    try {
      const { data } = await getOverallReport(filterClass, filterSection);
      setOverallReport(data);
    } catch (err) {
      console.error("Failed to fetch overall report:", err);
      setOverallReport(null);
    }
  }, [filterClass, filterSection]);

  useEffect(() => {
    fetchOverallReport();
  }, [fetchOverallReport, refreshTrigger]);

  // Build class/section breakdown
  const fetchClassSectionReport = useCallback(async () => {
    if (!filterClass || !filterSection) {
      setClassReport([]);
      return;
    }
    try {
      const { data: sectionStudents } = await getStudents(
        filterClass,
        filterSection
      );

      const reports = await Promise.all(
        sectionStudents.map(async (s) => {
          try {
            const { data: stats } = await getStudentReport(s._id);
            return { ...s, stats };
          } catch {
            return {
              ...s,
              stats: {
                totalDays: 0,
                present: 0,
                absent: 0,
                late: 0,
                leave: 0,
                totalMarked: 0,
                presentPercentage: "0.0",
              },
            };
          }
        })
      );
      setClassReport(reports);
    } catch (err) {
      console.error("Failed to fetch class section report:", err);
      setClassReport([]);
    }
  }, [filterClass, filterSection]);

  useEffect(() => {
    fetchClassSectionReport();
  }, [fetchClassSectionReport, refreshTrigger]);

  const handleRefresh = () => {
    fetchStudentReport();
    fetchOverallReport();
    fetchClassSectionReport();
  };

  return (
    <section className="card full-width">
      <div className="card-header">
        <div>
          <h2>
            <i className="fa-solid fa-chart-pie"></i> Attendance Reports
          </h2>
        </div>
        <div className="flex-row">
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
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            <option value="">Select student…</option>
            {students
              .slice()
              .sort((a, b) => a.roll.localeCompare(b.roll, undefined, { numeric: true }))
              .map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.roll})
                </option>
              ))}
          </select>
          <button className="btn btn-outline btn-small" onClick={handleRefresh}>
            <i className="fa-solid fa-rotate"></i> Refresh
          </button>
        </div>
      </div>

      <div className="section-body">
        <div className="reports-grid">
          <div className="flex-grow">
            <h3 className="section-action-title">
              <i className="fa-solid fa-user"></i> Student Summary
            </h3>
            <div className="summary-row" style={{ marginTop: "0.2rem" }}>
              {!selectedStudentId ? (
                <span className="muted">No student selected.</span>
              ) : !studentReport ? (
                <span className="muted">Loading...</span>
              ) : (
                <>
                  <div className="summary-item">
                    <strong>{studentReport.totalDays}</strong>{" "}
                    {studentReport.totalDays === 1 ? "day" : "days"} marked
                  </div>
                  <div className="summary-item">
                    <strong>{studentReport.present}</strong> Present
                  </div>
                  <div className="summary-item">
                    <strong>{studentReport.absent}</strong> Absent
                  </div>
                  <div className="summary-item">
                    <strong>{studentReport.late}</strong> Late
                  </div>
                  <div className="summary-item">
                    <strong>{studentReport.leave}</strong> On Leave
                  </div>
                  <div className="summary-item">
                    Attended <strong>{studentReport.presentPercentage}%</strong>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex-grow">
            <h3 className="section-action-title">
              <i className="fa-solid fa-layer-group"></i> Overall Summary
            </h3>
            <div className="summary-row">
              {!overallReport ? (
                <span className="muted">Loading...</span>
              ) : (
                <>
                  <div className="summary-item">
                    <strong>{overallReport.totalDays}</strong>{" "}
                    {overallReport.totalDays === 1 ? "day" : "days"} with
                    attendance
                  </div>
                  <div className="summary-item">
                    <strong>{overallReport.totalMarked}</strong> Total entries
                  </div>
                  <div className="summary-item">
                    <strong>{overallReport.present}</strong> Present
                  </div>
                  <div className="summary-item">
                    <strong>{overallReport.absent}</strong> Absent
                  </div>
                  <div className="summary-item">
                    <strong>{overallReport.late}</strong> Late
                  </div>
                  <div className="summary-item">
                    <strong>{overallReport.leave}</strong> On Leave
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="divider"></div>
        <h3 className="section-action-title">
          <i className="fa-solid fa-users-line"></i> Class &amp; Section
          Breakdown
        </h3>
        <div className="attendance-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Roll</th>
                <th>Name</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>On Leave</th>
                <th>Days Marked</th>
                <th>Present %</th>
              </tr>
            </thead>
            <tbody>
              {!filterClass || !filterSection ? (
                <tr>
                  <td colSpan="8" className="muted">
                    Select class and section above to view full breakdown.
                  </td>
                </tr>
              ) : classReport.length === 0 ? (
                <tr>
                  <td colSpan="8" className="muted">
                    No students found for {filterClass} – Section{" "}
                    {filterSection}.
                  </td>
                </tr>
              ) : (
                classReport
                  .slice()
                  .sort((a, b) => a.roll.localeCompare(b.roll, undefined, { numeric: true }))
                  .map((s) => (
                  <tr key={s._id}>
                    <td>{s.roll}</td>
                    <td>{s.name}</td>
                    <td>{s.stats.present}</td>
                    <td>{s.stats.absent}</td>
                    <td>{s.stats.late}</td>
                    <td>{s.stats.leave}</td>
                    <td>{s.stats.totalMarked}</td>
                    <td>{s.stats.presentPercentage}%</td>
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
