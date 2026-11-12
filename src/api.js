import { initialTasks, users } from './data';

let tasks = initialTasks.map((task) => ({ ...task }));
const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  async login(username, password) {
    await wait();
    const user = users.find((item) => item.username === username && item.password === password);
    if (!user) throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    const { password: ignored, ...safeUser } = user;
    return { user: safeUser, token: `mock-token-${user.id}` };
  },

  async getTasks() {
    await wait();
    return tasks.map((task) => ({ ...task }));
  },

  async createTask(title, assignedTo, dueDate) {
    await wait();
    const assignees = assignedTo.map(Number).filter(Boolean);
    if (!title.trim() || assignees.length === 0 || !dueDate) throw new Error('กรุณากรอกข้อมูลให้ครบ');
    const task = { id: Date.now(), title: title.trim(), assignedTo: assignees, status: 'To Do', dueDate };
    tasks = [...tasks, task];
    return { ...task };
  },

  async updateTask(id, title, assignedTo, dueDate) {
    await wait();
    const task = tasks.find((item) => item.id === id);
    const assignees = assignedTo.map(Number).filter(Boolean);
    if (!task) throw new Error('ไม่พบ task');
    if (!title.trim() || assignees.length === 0 || !dueDate) throw new Error('กรุณากรอกข้อมูลให้ครบ');
    const updated = { ...task, title: title.trim(), assignedTo: assignees, dueDate };
    tasks = tasks.map((item) => item.id === id ? updated : item);
    return { ...updated };
  },

  async updateTaskStatus(id, status) {
    await wait();
    const task = tasks.find((item) => item.id === id);
    if (!task) throw new Error('ไม่พบ task');
    if (!['To Do', 'Done'].includes(status) || task.status === status) {
      throw new Error('เปลี่ยนสถานะไม่ได้');
    }
    task.status = status;
    return { ...task };
  },
};
