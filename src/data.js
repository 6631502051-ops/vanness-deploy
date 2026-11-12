export const users = [
  { id: 1, username: 'admin', password: 'admin123', name: 'System Admin', role: 'admin' },
  { id: 2, username: 'alice', password: 'alice123', name: 'Alice', role: 'employee' },
  { id: 3, username: 'bob', password: 'bob123', name: 'Bob', role: 'employee' },
];

export const initialTasks = [
  { id: 1, title: 'เตรียม project brief', assignedTo: [2], status: 'To Do', dueDate: '2026-11-12' },
  { id: 2, title: 'ออกแบบหน้า login', assignedTo: [2], status: 'Done', dueDate: '2026-11-05' },
  { id: 3, title: 'วางโครง database', assignedTo: [3], status: 'To Do', dueDate: '2026-11-15' },
  { id: 4, title: 'เขียน API contract', assignedTo: [2, 3], status: 'To Do', dueDate: '2026-11-18' },
  { id: 5, title: 'ตรวจ acceptance criteria', assignedTo: [2], status: 'To Do', dueDate: '2026-11-20' },
];
