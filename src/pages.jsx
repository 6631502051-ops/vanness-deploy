import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mockApi } from './api';
import { users } from './data';
import { useAuth } from './AuthContext';

const employees = users.filter((user) => user.role === 'employee');
const statusOptions = ['All', 'To Do', 'Done'];

function Layout({ children }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <main className="shell">
      <header>
        <div><strong>Task Dashboard</strong><small>{auth.user.name} ({auth.user.role})</small></div>
        <button onClick={() => { auth.logout(); navigate('/login'); }}>ออกจากระบบ</button>
      </header>
      {location.state?.message && <p className="notice">{location.state.message}</p>}
      {children}
    </main>
  );
}

function Summary({ tasks }) {
  const done = tasks.filter((task) => task.status === 'Done').length;
  const overdue = tasks.filter((task) => task.status !== 'Done' && task.dueDate < new Date().toISOString().slice(0, 10)).length;
  return <div className="summary">
    <div><strong>{tasks.length}</strong><span>งานทั้งหมด</span></div>
    <div><strong>{tasks.length - done}</strong><span>กำลังดำเนินการ</span></div>
    <div><strong>{done}</strong><span>เสร็จแล้ว</span></div>
    <div><strong>{overdue}</strong><span>เกินกำหนด</span></div>
  </div>;
}

function AssigneePicker({ value, onChange }) {
  const toggle = (id) => {
    const next = value.includes(id) ? value.filter((item) => item !== id) : [...value, id];
    onChange(next);
  };
  return <div className="assignee-picker" aria-label="สมาชิกงาน">
    {employees.map((employee) => <label key={employee.id}>
      <input type="checkbox" checked={value.includes(employee.id)} onChange={() => toggle(employee.id)} />
      <span>{employee.name}</span>
    </label>)}
  </div>;
}

function TaskList({ tasks, onStatusChange, onEdit, savingId, allowReverse }) {
  return <ul className="tasks">{tasks.map((task) => {
    const assigneeNames = task.assignedTo.map((id) => users.find((user) => user.id === id)?.name).filter(Boolean).join(', ');
    const overdue = task.status !== 'Done' && task.dueDate < new Date().toISOString().slice(0, 10);
    return <li key={task.id}>
      <span><strong>{task.title}</strong><small>{assigneeNames} · {task.assignedTo.length > 1 ? 'งานกลุ่ม' : 'งานเดี่ยว'} · กำหนดส่ง {task.dueDate}{overdue && <em> · เกินกำหนด</em>}</small></span>
      {onStatusChange && (task.status === 'To Do' || allowReverse) && <button disabled={savingId === task.id} onClick={() => onStatusChange(task)}>
        {savingId === task.id ? 'กำลังบันทึก...' : task.status === 'To Do' ? 'ทำเสร็จแล้ว' : 'เปลี่ยนเป็น To Do'}
      </button>}
      {onEdit && <button className="secondary-button" disabled={savingId === task.id} onClick={() => onEdit(task)}>แก้ไขรายละเอียด</button>}
      <b className={task.status === 'Done' ? 'done' : 'todo'}>{task.status}</b>
    </li>;
  })}</ul>;
}

function Filters({ status, setStatus, assignee, setAssignee }) {
  return <div className="filters">
    <label>สถานะ<select value={status} onChange={(event) => setStatus(event.target.value)}>{statusOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
    {setAssignee && <label>ผู้รับผิดชอบ<select value={assignee} onChange={(event) => setAssignee(event.target.value)}><option value="All">ทุกคน</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}</select></label>}
  </div>;
}

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError('');
    try { const { user } = await auth.login(username, password); navigate(user.role === 'admin' ? '/admin' : '/employee', { replace: true }); }
    catch (error) { setError(error.message); } finally { setLoading(false); }
  };
  return <main className="login"><form onSubmit={submit}><h1>เข้าสู่ระบบ</h1>
    <label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} /></label>
    <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
    {error && <p className="error">{error}</p>}<button disabled={loading}>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</button>
    <p className="hint">ทดลอง: admin/admin123, alice/alice123, bob/bob123</p>
  </form></main>;
}

export function AdminPage() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('All');
  const [assignee, setAssignee] = useState('All');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { mockApi.getTasks().then(setTasks).catch(() => setError('โหลดข้อมูลไม่สำเร็จ')).finally(() => setLoading(false)); }, []);
  const create = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    try { const task = await mockApi.createTask(title, assignedTo, dueDate); setTasks((current) => [...current, task]); setTitle(''); setAssignedTo([]); setDueDate(''); }
    catch (error) { setError(error.message); } finally { setSaving(false); }
  };
  const toggleStatus = async (task) => {
    setSavingId(task.id); setError('');
    try { const updated = await mockApi.updateTaskStatus(task.id, task.status === 'To Do' ? 'Done' : 'To Do'); setTasks((current) => current.map((item) => item.id === updated.id ? updated : item)); }
    catch (error) { setError(error.message); } finally { setSavingId(null); }
  };
  const edit = async (event) => {
    event.preventDefault();
    setSavingId(editingTask.id); setError('');
    try {
      const updated = await mockApi.updateTask(editingTask.id, editingTask.title, editingTask.assignedTo, editingTask.dueDate);
      setTasks((current) => current.map((item) => item.id === updated.id ? updated : item));
      setEditingTask(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setSavingId(null);
    }
  };
  const visible = tasks.filter((task) => (status === 'All' || task.status === status) && (assignee === 'All' || task.assignedTo.includes(Number(assignee))));
  return <Layout><section className="content"><h1>Admin dashboard</h1><Summary tasks={tasks} />
    <form className="new-task" onSubmit={create}><h2>สร้างงาน</h2>
      <input aria-label="ชื่องาน" placeholder="ชื่องาน" value={title} onChange={(event) => setTitle(event.target.value)} />
      <label>สมาชิกงาน (เลือกได้หลายคน)<AssigneePicker value={assignedTo.map(Number)} onChange={setAssignedTo} /></label>
      <label>กำหนดส่ง<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>
      <button disabled={saving}>{saving ? 'กำลังบันทึก...' : 'สร้างงาน'}</button>
    </form>
    {editingTask && <form className="edit-task" onSubmit={edit}>
      <div className="edit-heading"><h2>แก้ไขรายละเอียดงาน</h2><button type="button" className="secondary-button" onClick={() => setEditingTask(null)}>ยกเลิก</button></div>
      <input aria-label="ชื่องานที่แก้ไข" value={editingTask.title} onChange={(event) => setEditingTask({ ...editingTask, title: event.target.value })} />
      <label>สมาชิกงาน (เลือกได้หลายคน)<AssigneePicker value={editingTask.assignedTo} onChange={(value) => setEditingTask({ ...editingTask, assignedTo: value })} /></label>
      <label>กำหนดส่ง<input type="date" value={editingTask.dueDate} onChange={(event) => setEditingTask({ ...editingTask, dueDate: event.target.value })} /></label>
      <button disabled={savingId === editingTask.id}>{savingId === editingTask.id ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}</button>
    </form>}
    {error && <p className="error">{error}</p>}<Filters status={status} setStatus={setStatus} assignee={assignee} setAssignee={setAssignee} />
    {loading ? <p>กำลังโหลด...</p> : <TaskList tasks={visible} onStatusChange={toggleStatus} onEdit={setEditingTask} savingId={savingId} allowReverse />}
  </section></Layout>;
}

export function EmployeePage() {
  const auth = useAuth();
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { mockApi.getTasks().then(setTasks).catch(() => setError('โหลดข้อมูลไม่สำเร็จ')).finally(() => setLoading(false)); }, []);
  const markDone = async (task) => {
    setSavingId(task.id); setError('');
    try { const updated = await mockApi.updateTaskStatus(task.id, 'Done'); setTasks((current) => current.map((item) => item.id === updated.id ? updated : item)); }
    catch (error) { setError(error.message); } finally { setSavingId(null); }
  };
  const ownTasks = useMemo(() => tasks.filter((task) => task.assignedTo.includes(auth.user.id) && (status === 'All' || task.status === status)), [tasks, status, auth.user.id]);
  return <Layout><section className="content"><h1>My dashboard</h1><Summary tasks={ownTasks} /><Filters status={status} setStatus={setStatus} />
    {error && <p className="error">{error}</p>}{loading ? <p>กำลังโหลด...</p> : <TaskList tasks={ownTasks} onStatusChange={markDone} savingId={savingId} />}
  </section></Layout>;
}

export function RedirectNotice() {
  const location = useLocation();
  return <p className="notice">{location.state?.message || 'กำลังเปลี่ยนหน้า...'}</p>;
}
