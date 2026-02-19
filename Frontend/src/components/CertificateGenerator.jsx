import { useState, useEffect, useRef } from "react";
import { getStudents, getStudentReport } from "../api/api";

export default function CertificateGenerator({ refreshTrigger }) {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [includeSeal, setIncludeSeal] = useState(true);
  const [stats, setStats] = useState(null);
  const certRef = useRef(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data } = await getStudents();
        setStudents(data);
      } catch (err) {
        console.error("Failed to fetch students:", err);
      }
    };
    fetchStudents();
  }, [refreshTrigger]);

  useEffect(() => {
    if (!selectedId) {
      setStats(null);
      return;
    }
    const fetchReport = async () => {
      try {
        const { data } = await getStudentReport(selectedId);
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setStats(null);
      }
    };
    fetchReport();
  }, [selectedId, refreshTrigger]);

  const selectedStudent = students.find((s) => s._id === selectedId);
  const recipientName = selectedStudent?.name || "[Name of Recipient]";
  const courseDisplay = courseName || "[Name of Event]";
  const totalDays = stats?.totalDays || 0;
  const presentPct = stats?.presentPercentage || "0.0";
  const absentPct = stats?.totalMarked
    ? ((stats.absent / stats.totalMarked) * 100).toFixed(1)
    : "0.0";
  const lateCount = stats?.late || 0;

  const handleDownload = async () => {
    if (!selectedId) {
      alert("Please select a student to generate the certificate.");
      return;
    }

    const html2pdf = (await import("html2pdf.js")).default;
    const element = certRef.current;
    if (!element) return;

    const filename = `Certificate_${recipientName.replace(/\s+/g, "_")}.pdf`;

    const cloned = element.cloneNode(true);
    cloned.classList.add("no-shadow");
    cloned.style.transform = "none";
    cloned.style.margin = "0";
    cloned.style.width = "1000px";
    cloned.style.height = "760px";
    cloned.style.boxSizing = "border-box";
    cloned.style.webkitPrintColorAdjust = "exact";
    cloned.style.printColorAdjust = "exact";

    cloned.querySelectorAll("*").forEach((el) => {
      el.style.webkitPrintColorAdjust = "exact";
      el.style.printColorAdjust = "exact";
    });

    if (!includeSeal) {
      const sealEl = cloned.querySelector(".seal");
      if (sealEl) sealEl.style.display = "none";
    }

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "-10000px";
    container.style.left = "0";
    container.style.width = "100%";
    container.style.zIndex = "-10000";
    container.appendChild(cloned);
    document.body.appendChild(container);

    try {
      if (document.fonts?.ready) await document.fonts.ready;

      await html2pdf()
        .set({
          margin: 10,
          filename,
          image: { type: "png", quality: 1 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: null,
            scrollY: 0,
            logging: false,
          },
          jsPDF: { unit: "pt", format: "a4", orientation: "landscape" },
          pagebreak: { mode: "avoid-all" },
        })
        .from(cloned)
        .save();
    } catch (err) {
      console.error("Failed generating certificate PDF:", err);
      alert("An error occurred while generating the PDF.");
    } finally {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  };

  return (
    <section className="card full-width">
      <div className="card-header">
        <div>
          <h2>
            <i className="fa-solid fa-award"></i> Certificate Generation
          </h2>
          <p className="muted">
            Generate and download an official certificate with attendance
            statistics.
          </p>
        </div>
      </div>

      <div className="section-body">
        <div
          className="form-grid"
          style={{
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "0.6rem",
          }}
        >
          <div className="form-field">
            <label>Select Student</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">-- Choose Student --</option>
              {students
                .slice()
                .sort((a, b) => a.roll.localeCompare(b.roll, undefined, { numeric: true }))
                .map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.roll})
                  </option>
                ))}
            </select>
          </div>

          <div className="form-field">
            <label>Course / Event Name</label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g. Annual Bootcamp"
            />
          </div>

          <div
            className="form-field"
            id="download-desktop-wrapper"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "0.6rem",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                fontSize: "0.8rem",
              }}
            >
              <input
                type="checkbox"
                checked={includeSeal}
                onChange={(e) => setIncludeSeal(e.target.checked)}
                style={{ width: "14px", height: "14px" }}
              />
              Include Official Seal
            </label>
            <button className="btn btn-primary" onClick={handleDownload}>
              <i className="fa-solid fa-file-pdf"></i> Download PDF
            </button>
          </div>
        </div>

        <div className="divider"></div>
        <h3 className="section-action-title">Live Preview</h3>
        <p id="cert-mobile-note" className="muted">
          Live preview is hidden on small and medium screens. You can still
          generate the certificate using the Download PDF button above.
        </p>

        <div className="cert-preview-container">
          <div className="certificate-view" ref={certRef}>
            <div className="cert-inner-border">
              <div className="cert-title">Certificate of Attendance</div>
              <div className="cert-subtitle">
                This certificate is proudly awarded to
              </div>

              <div className="cert-recipient">{recipientName}</div>

              <div className="cert-body-text">
                To certify his/her attendance to the{" "}
                <strong>{courseDisplay}</strong>. Below is the detailed record of
                attendance and participation.
              </div>

              <div className="cert-stats-grid">
                <div className="cert-stat-item">
                  <div className="cert-stat-val">{totalDays}</div>
                  <div className="cert-stat-label">Total Days</div>
                </div>
                <div className="cert-stat-item">
                  <div className="cert-stat-val">{presentPct}%</div>
                  <div className="cert-stat-label">Present</div>
                </div>
                <div className="cert-stat-item">
                  <div className="cert-stat-val">{absentPct}%</div>
                  <div className="cert-stat-label">Absent</div>
                </div>
                <div className="cert-stat-item">
                  <div className="cert-stat-val">{lateCount}</div>
                  <div className="cert-stat-label">Lates</div>
                </div>
              </div>

              <div className="cert-footer">
                <div className="cert-signature">
                  <h4>Principal Signature</h4>
                  <p>Principal</p>
                </div>
                {includeSeal && (
                  <div className="seal">
                    OFFICIAL
                    <br />
                    SEAL
                    <br />
                    2025
                  </div>
                )}
                <div className="cert-signature">
                  <h4>Director Signature</h4>
                  <p>Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
