import { useState,useEffect } from "react";
import AppLayout from "./components/AppLayout";
import StudentForm from "./components/StudentForm";
import StudentManagement from "./components/StudentManagement";
import DailyAttendance from "./components/DailyAttendance";
import Reports from "./components/Reports";
import CertificateGenerator from "./components/CertificateGenerator";
import { createStudent, updateStudent } from "./api/api";

export default function Dashboard() {
  const [editStudent, setEditStudent] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  useEffect(() => {
    const interval = setInterval(() => {
      triggerRefresh();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveStudent = async (studentData) => {
    try {
      if (editStudent) {
        await updateStudent(editStudent._id, studentData);
      } else {
        await createStudent(studentData);
      }
      setEditStudent(null);
      triggerRefresh();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save student.");
    }
  };

  const handleEditStudent = (student) => {
    setEditStudent(student);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditStudent(null);
  };

  return (
    <AppLayout>
      <StudentForm
        editStudent={editStudent}
        onSave={handleSaveStudent}
        onCancel={handleCancelEdit}
      />

      <main className="main-grid">
        <StudentManagement
          onEdit={handleEditStudent}
          refreshTrigger={refreshTrigger}
        />

        <DailyAttendance refreshTrigger={refreshTrigger} />

        <Reports refreshTrigger={refreshTrigger} />

        <CertificateGenerator refreshTrigger={refreshTrigger} />
      </main>
    </AppLayout>
  );
}
