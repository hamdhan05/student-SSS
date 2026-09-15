import { useEffect, useState } from 'react';
import { getStudents, getStudentById, getNotices, getHomework } from '../lib/api';
import {
  students as mockStudents,
  notices as mockNotices,
  homeworks as mockHomeworks,
  academicRecords as mockAcademics,
  feeRecords as mockFees,
  attendanceRecords as mockAttendance
} from '../lib/mockData';

const VerifyPage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [notices, setNotices] = useState<any[]>([]);
  const [homework, setHomework] = useState<any[]>([]);
  const [source, setSource] = useState<string>('Supabase DB');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        // Attempt Supabase fetch
        const studentRes = await getStudents({ q: 'Alice' });
        if (studentRes.data && studentRes.data.length > 0) {
          const alice = studentRes.data[0];
          const prof = await getStudentById(alice.id);
          setProfile(prof);

          const noticesData = await getNotices();
          setNotices(noticesData || []);

          const hw = await getHomework({ classId: '10', section: 'A' });
          setHomework(hw || []);

          setSource('Supabase Live Database');
        } else {
          throw new Error('No live data returned from Supabase');
        }
      } catch (e) {
        console.warn('Supabase fetch failed or unavailable, loading mock data fallback:', e);

        // Fallback to rich mock data
        const alice = mockStudents.find(s => s.name.includes('Alice')) || mockStudents[0];
        const studentAcademics = mockAcademics.filter(a => a.studentId === alice.id);
        const studentFees = mockFees.find(f => f.studentId === alice.id);
        const studentAtt = mockAttendance.filter(a => a.studentId === alice.id);
        const presentCount = studentAtt.filter(a => a.status === 'present').length;
        const attPercentage = studentAtt.length > 0 ? Math.round((presentCount / studentAtt.length) * 100) : 85;

        setProfile({
          ...alice,
          academics: studentAcademics,
          fees: studentFees,
          attendance: studentAtt,
          attendancePercentage: attPercentage
        });

        setNotices(mockNotices);
        setHomework(mockHomeworks);
        setSource('Mock Data Store');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <h2>Loading School Portal Verification Data...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '1000px', margin: '0 auto', color: '#1a1a1a', lineHeight: '1.5' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #3b82f6', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, color: '#1e3a8a' }}>🏫 School Management Portal Output</h1>
        <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '0.4rem 0.8rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>
          Source: {source}
        </span>
      </div>

      {profile && (
        <section style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ marginTop: 0, color: '#2563eb', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem' }}>
            👤 Student Profile: {profile.name}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div><strong>Roll Number:</strong> {profile.rollNumber}</div>
            <div><strong>Class & Section:</strong> {profile.class}-{profile.section}</div>
            <div><strong>Email:</strong> {profile.email}</div>
            <div><strong>Phone:</strong> {profile.phone}</div>
            <div><strong>Date of Birth:</strong> {profile.dateOfBirth}</div>
            <div><strong>Parent Name:</strong> {profile.parentName}</div>
            <div><strong>Parent Phone:</strong> {profile.parentPhone}</div>
            <div><strong>Address:</strong> {profile.address}</div>
          </div>

          <h3 style={{ marginTop: '1.5rem', color: '#1e40af' }}>💳 Fee Records</h3>
          {profile.fees ? (
            <div style={{ display: 'flex', gap: '1.5rem', background: '#ffffff', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div><strong>Total Fee:</strong> ₹{profile.fees.totalFee}</div>
              <div><strong>Paid Amount:</strong> <span style={{ color: '#16a34a', fontWeight: 'bold' }}>₹{profile.fees.paidAmount}</span></div>
              <div><strong>Due Amount:</strong> <span style={{ color: '#dc2626', fontWeight: 'bold' }}>₹{profile.fees.dueAmount}</span></div>
            </div>
          ) : <p>No fee records found.</p>}

          <h3 style={{ marginTop: '1.5rem', color: '#1e40af' }}>📅 Attendance</h3>
          <p>
            <strong>Attendance Rate:</strong>{' '}
            <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>
              {profile.attendancePercentage}%
            </span>
          </p>

          <h3 style={{ marginTop: '1.5rem', color: '#1e40af' }}>📚 Academics</h3>
          {profile.academics && profile.academics.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>Subject</th>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>Marks</th>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>Grade</th>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>Term</th>
                </tr>
              </thead>
              <tbody>
                {profile.academics.map((ac: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px' }}>{ac.subject}</td>
                    <td style={{ padding: '10px 12px' }}>{ac.marks}/{ac.totalMarks}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 'bold' }}>{ac.grade}</td>
                    <td style={{ padding: '10px 12px' }}>{ac.term}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>No academic records found.</p>}
        </section>
      )}

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>📢 School Notices ({notices.length})</h2>
        {notices.map((n) => (
          <div key={n.id} style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '1rem 1.2rem', borderRadius: '8px', marginBottom: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>{n.title}</h3>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>📅 {n.date}</span>
            </div>
            <p style={{ margin: '0.5rem 0 0 0', color: '#334155' }}>{n.content}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 style={{ color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>📝 Homework ({homework.length})</h2>
        {homework.map((h) => (
          <div key={h.id} style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '1rem 1.2rem', borderRadius: '8px', marginBottom: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>{h.subject}: {h.title}</h3>
              <span style={{ color: '#ef4444', fontWeight: '500', fontSize: '0.85rem' }}>⏳ Due: {h.dueDate}</span>
            </div>
            <p style={{ margin: '0.5rem 0 0 0', color: '#334155' }}>{h.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default VerifyPage;
