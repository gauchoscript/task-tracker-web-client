import type { Task } from '@/lib/types';
import { TaskStatus } from '@/lib/types';
import { http, HttpResponse } from 'msw';

const apiUrl = import.meta.env.VITE_API_URL;

// Initial tasks state
let tasks: Task[] = [
  { id: '1', title: 'Test Task 1', description: 'Description 1', status: TaskStatus.TODO, due_date: '2026-12-31', position: 1, user_id: 'u1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', title: 'Test Task 2', description: 'Description 2', status: TaskStatus.TODO, position: 2, user_id: 'u1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', title: 'Test Task 3', description: 'Description 3', status: TaskStatus.DONE, position: 3, user_id: 'u1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

let notifications = [
  {
    id: 'n1',
    task_id: '1',
    title: 'Unread Notification',
    message: 'This is an unread notification',
    read_at: null,
    sent_at: new Date().toISOString(),
  },
  {
    id: 'n2',
    task_id: '2',
    title: 'Read Notification',
    message: 'This is a read notification',
    read_at: new Date().toISOString(),
    sent_at: new Date().toISOString(),
  },
];

export const handlers = [
  // Auth
  http.post(`${apiUrl}/auth/signup`, () => {
    return HttpResponse.json({ message: 'User created successfully' }, { status: 201 })
  }),

  http.post(`${apiUrl}/auth/signin`, () => {
    return HttpResponse.json({ access_token: 'fake-token', refresh_token: 'fake-refresh', token_type: 'bearer' }, { status: 200 })
  }),

  http.post(`${apiUrl}/auth/refresh`, async ({ request }) => {
    const { refresh_token, email } = await request.json() as { refresh_token: string, email: string };
    if (refresh_token === 'fake-refresh' && email) {
      return HttpResponse.json({ access_token: 'new-fake-token', refresh_token: 'fake-refresh', token_type: 'bearer' }, { status: 200 })
    }
    return new HttpResponse(null, { status: 401 });
  }),

  // Tasks
  http.get(`${apiUrl}/tasks`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    const filteredTasks = status
      ? tasks.filter(t => t.status === status)
      : tasks;

    return HttpResponse.json(filteredTasks)
  }),

  http.get(`${apiUrl}/tasks/:id`, ({ params }) => {
    const { id } = params;
    const task = tasks.find(t => t.id === id);
    if (!task) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(task, { status: 200 });
  }),

  http.post(`${apiUrl}/tasks`, async ({ request }) => {
    const newTask = await request.json() as Partial<Task>;
    const createdTask: Task = {
      title: 'New Task',
      description: '',
      position: tasks.length + 1,
      user_id: 'u1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...newTask,
      id: 'new-task-id', // Deterministic ID for creation test
      status: TaskStatus.TODO
    };
    tasks.push(createdTask);
    return HttpResponse.json(createdTask, { status: 201 })
  }),

  http.patch(`${apiUrl}/tasks/:id`, async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json() as Partial<Task>;
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
      tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
      return HttpResponse.json(tasks[taskIndex], { status: 200 })
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.delete(`${apiUrl}/tasks/:id`, ({ params }) => {
    const { id } = params;
    tasks = tasks.filter(t => t.id !== id);
    return new HttpResponse(null, { status: 204 })
  }),

  // Notifications
  http.post(`${apiUrl}/notifications/devices`, () => {
    return new HttpResponse(null, { status: 201 });
  }),

  http.get(`${apiUrl}/notifications`, () => {
    return HttpResponse.json({
      items: notifications,
      total: notifications.length,
      skip: 0,
      limit: 20
    });
  }),

  http.patch(`${apiUrl}/notifications/:id/read`, ({ params }) => {
    const { id } = params;
    const index = notifications.findIndex(n => n.id === id);
    if (index > -1) {
      notifications[index] = { ...notifications[index], read_at: new Date().toISOString() };
      return HttpResponse.json(notifications[index], { status: 200 });
    }
    return new HttpResponse(null, { status: 404 });
  }),
]

// Allow resetting state for tests
export const resetMocks = () => {
  tasks = [
    { id: '1', title: 'Test Task 1', description: 'Description 1', status: TaskStatus.TODO, due_date: '2026-12-31', position: 1, user_id: 'u1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', title: 'Test Task 2', description: 'Description 2', status: TaskStatus.TODO, position: 2, user_id: 'u1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '3', title: 'Test Task 3', description: 'Description 3', status: TaskStatus.DONE, position: 3, user_id: 'u1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];

  notifications = [
    {
      id: 'n1',
      task_id: '1',
      title: 'Unread Notification',
      message: 'This is an unread notification',
      read_at: null,
      sent_at: new Date().toISOString(),
    },
    {
      id: 'n2',
      task_id: '2',
      title: 'Read Notification',
      message: 'This is a read notification',
      read_at: new Date().toISOString(),
      sent_at: new Date().toISOString(),
    },
  ];
}
