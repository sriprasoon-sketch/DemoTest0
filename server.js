const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const dataFile = path.resolve(__dirname, 'tasks.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function ensureDataFile() {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([], null, 2), 'utf8');
  }
}

function readTasks() {
  ensureDataFile();
  const raw = fs.readFileSync(dataFile, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function writeTasks(tasks) {
  fs.writeFileSync(dataFile, JSON.stringify(tasks, null, 2), 'utf8');
}

function createTaskId() {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

app.get('/api/tasks', (req, res) => {
  const tasks = readTasks();
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { title, category, reminder, location, notification, notes } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Task title is required.' });
  }

  const newTask = {
    id: createTaskId(),
    title: title.trim(),
    category: category ? category.trim() : 'General',
    reminder: reminder || null,
    location: location ? location.trim() : '',
    notification: Boolean(notification),
    notes: notes ? notes.trim() : '',
    createdAt: new Date().toISOString(),
    completed: false
  };

  const tasks = readTasks();
  tasks.unshift(newTask);
  writeTasks(tasks);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const update = req.body;
  const tasks = readTasks();
  const index = tasks.findIndex((task) => task.id === taskId);

  if (index === -1) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  tasks[index] = {
    ...tasks[index],
    ...update,
    title: update.title ? update.title.trim() : tasks[index].title,
    category: update.category ? update.category.trim() : tasks[index].category,
    location: update.location ? update.location.trim() : tasks[index].location,
    notes: update.notes ? update.notes.trim() : tasks[index].notes,
    notification: typeof update.notification === 'boolean' ? update.notification : tasks[index].notification,
    reminder: update.reminder !== undefined ? update.reminder : tasks[index].reminder,
    completed: typeof update.completed === 'boolean' ? update.completed : tasks[index].completed
  };

  writeTasks(tasks);
  res.json(tasks[index]);
});

app.delete('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const tasks = readTasks();
  const filtered = tasks.filter((task) => task.id !== taskId);

  if (filtered.length === tasks.length) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  writeTasks(filtered);
  res.status(204).end();
});

app.get('/api/categories', (req, res) => {
  const tasks = readTasks();
  const categories = Array.from(new Set(tasks.map((task) => task.category || 'General')));
  res.json(categories.sort());
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`TODO app running at http://localhost:${PORT}`);
});
