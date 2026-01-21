import { http, HttpResponse } from 'msw';

const apiUrl = import.meta.env.VITE_API_URL;

// Initial tasks state
let tasks = [
  { id: '1', title: 'Test Task 1', description: 'Description 1', status: 'TODO' },
  { id: '2', title: 'Test Task 2', description: 'Description 2', status: 'IN_PROGRESS' },
];

export const handlers = [
  // Auth
  http.post(`${apiUrl}/auth/signup`, () => {
    return HttpResponse.json({ message: 'User created successfully' }, { status: 201 })
  }),

  http.post(`${apiUrl}/auth/signin`, () => {
    return HttpResponse.json({ access_token: 'fake-token', token_type: 'bearer' }, { status: 200 })
  }),

  // Tasks
  http.get(`${apiUrl}/tasks`, () => {
    return HttpResponse.json(tasks)
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
    const newTask = await request.json() as any;
    const createdTask = {
      ...newTask,
      id: 'new-task-id', // Deterministic ID for creation test
      status: 'TODO'
    };
    tasks.push(createdTask);
    return HttpResponse.json(createdTask, { status: 201 })
  }),

  http.patch(`${apiUrl}/tasks/:id`, async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json() as any;
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
]

// Allow resetting tasks for tests if needed
export const resetTasks = () => {
  tasks = [
    { id: '1', title: 'Test Task 1', description: 'Description 1', status: 'TODO' },
    { id: '2', title: 'Test Task 2', description: 'Description 2', status: 'IN_PROGRESS' },
  ];
}
