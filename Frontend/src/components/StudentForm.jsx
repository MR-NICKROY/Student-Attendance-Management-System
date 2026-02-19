import { useState, useEffect } from "react";

export default function StudentForm({ editStudent, onSave, onCancel }) {
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (editStudent) {
      setName(editStudent.name || "");
      setRoll(editStudent.roll || "");
      setClassName(editStudent.className || "");
      setSection(editStudent.section || "");
      setEmail(editStudent.email || "");
      setPhone(editStudent.phone || "");
    } else {
      resetForm();
    }
  }, [editStudent]);

  const resetForm = () => {
    setName("");
    setRoll("");
    setClassName("");
    setSection("");
    setEmail("");
    setPhone("");
  };

  const handleSubmit = () => {
    if (!name.trim() || !roll.trim()) {
      alert("Name and Roll No. are required.");
      return;
    }

    onSave({
      name: name.trim(),
      roll: roll.trim(),
      className: className.trim() || "N/A",
      section: section.trim() || "N/A",
      email: email.trim(),
      phone: phone.trim(),
    });

    if (!editStudent) resetForm();
  };

  const handleClear = () => {
    resetForm();
    if (onCancel) onCancel();
  };

  const isEditing = !!editStudent;

  return (
    <section className="card" style={{ marginTop: "0.75rem" }}>
      <div className="card-header">
        <div>
          <h2>
            <i
              className={
                isEditing ? "fa-solid fa-user-pen" : "fa-solid fa-user-plus"
              }
            ></i>
            <span>{isEditing ? "Edit Student Info" : "Add New Student"}</span>
          </h2>
          <p className="muted">Manage student master data.</p>
        </div>
      </div>
      <div className="section-body">
        <div className="form-grid">
          <div className="form-field">
            <label>
              <i className="fa-solid fa-id-badge"></i> Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Arjun Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>
              <i className="fa-solid fa-hashtag"></i> Roll No.
            </label>
            <input
              type="text"
              placeholder="e.g. 10A07"
              value={roll}
              onChange={(e) => setRoll(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>
              <i className="fa-solid fa-building-columns"></i> Class
            </label>
            <input
              type="text"
              placeholder="e.g. 10th"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>
              <i className="fa-solid fa-layer-group"></i> Section
            </label>
            <input
              type="text"
              placeholder="e.g. A"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>
              <i className="fa-solid fa-envelope"></i> Email
            </label>
            <input
              type="email"
              placeholder="e.g. arjun.patel@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>
              <i className="fa-solid fa-phone"></i> Phone
            </label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-row" style={{ justifyContent: "flex-end", gap: "0.4rem" }}>
          <button className="btn btn-outline btn-small" onClick={handleClear}>
            <i className="fa-solid fa-rotate-left"></i> Clear Form
          </button>
          <button className="btn btn-primary btn-small" onClick={handleSubmit}>
            <i className="fa-solid fa-floppy-disk"></i>{" "}
            {isEditing ? "Update Student" : "Save Student"}
          </button>
        </div>
      </div>
    </section>
  );
}
