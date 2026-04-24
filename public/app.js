const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const categoryFilter = document.getElementById('category-filter');
const refreshTasksButton = document.getElementById('refresh-tasks');

// Modal elements
const conflictModal = document.getElementById('conflict-modal');
const conflictInfo = document.getElementById('conflict-info');
const timeSlots = document.getElementById('time-slots');
const closeModal = document.getElementById('close-modal');
const proceedAnyway = document.getElementById('proceed-anyway');
const addSelected = document.getElementById('add-selected');
const cancelAdd = document.getElementById('cancel-add');

let tasks = [];
let currentCategory = 'all';
let pendingTaskData = null; // Store task data when conflict occurs

async function fetchTasks() {
  const response = await fetch('/api/tasks');
  tasks = await response.json();
  renderTasks();
  loadCategories();
}

async function loadCategories() {
  const response = await fetch('/api/categories');
  const categories = await response.json();
  const options = ['all', ...categories];
  categoryFilter.innerHTML = options
    .map((category) => `<option value="${category}">${category}</option>`)
    .join('');
  categoryFilter.value = currentCategory;
}

function renderTasks() {
  const displayTasks = currentCategory === 'all'
    ? tasks
    : tasks.filter((task) => task.category === currentCategory);

  const reminderCounts = tasks.reduce((counts, task) => {
    const normalized = task.reminder ? normalizeReminder(task.reminder) : null;
    if (normalized) {
      counts[normalized] = (counts[normalized] || 0) + 1;
    }
    return counts;
  }, {});

  const reminderConflicts = tasks.reduce((conflicts, task) => {
    const normalized = task.reminder ? normalizeReminder(task.reminder) : null;
    if (normalized) {
      conflicts[normalized] = conflicts[normalized] || [];
      conflicts[normalized].push(task.title);
    }
    return conflicts;
  }, {});

  if (!displayTasks.length) {
    taskList.innerHTML = '<p>No tasks found for this category.</p>';
    return;
  }

  taskList.innerHTML = displayTasks.map((task) => {
    const reminderText = getReminderText(task.reminder);
    const locationText = task.location ? task.location : 'No location';
    const notesText = task.notes ? `<p>${task.notes}</p>` : '';
    const notificationTag = task.notification ? '<span>Notification</span>' : '';
    const completedClass = task.completed ? 'task-completed' : '';
    const reminderKey = task.reminder ? normalizeReminder(task.reminder) : null;
    const conflictCount = reminderKey ? reminderCounts[reminderKey] : 0;
    const conflictTitles = reminderKey ? reminderConflicts[reminderKey].filter((title) => title !== task.title) : [];
    const conflictBadge = conflictCount > 1
      ? `<span class="conflict-badge" title="Also scheduled: ${escapeHtml(conflictTitles.join(', '))}">${conflictCount} tasks at this time</span>`
      : '';
    const conflictDetail = conflictCount > 1
      ? `<p class="conflict-detail">Conflicts with: ${escapeHtml(conflictTitles.join(', '))}</p>`
      : '';

    return `
      <article class="task-card ${completedClass} ${conflictCount > 1 ? 'task-conflict' : ''}">
        <div class="task-card-header">
          <div class="task-card-title">
            <h3>${escapeHtml(task.title)}</h3>
            <div class="task-time" title="Scheduled at ${escapeHtml(reminderText)}">
              <span class="time-icon">🕒</span>
              <span>${escapeHtml(reminderText)}</span>
            </div>
          </div>
          <div class="task-meta">
            <span>${escapeHtml(task.category)}</span>
            ${notificationTag}
            ${conflictBadge}
          </div>
        </div>
        <div class="task-meta">
          <span>${escapeHtml(locationText)}</span>
        </div>
        ${conflictDetail}
        ${notesText}
        <div class="task-actions">
          <button onclick="toggleComplete('${task.id}')">${task.completed ? 'Mark incomplete' : 'Mark complete'}</button>
          <button class="delete" onclick="deleteTask('${task.id}')">Delete</button>
        </div>
      </article>
    `;
  }).join('');
}

function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = value;
  return element.innerHTML;
}

function getReminderText(reminder) {
  return reminder ? new Date(reminder).toLocaleString() : 'No reminder set';
}

function normalizeReminder(value) {
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : null;
}

async function addTask(event) {
  event.preventDefault();

  const title = document.getElementById('title').value;
  const category = document.getElementById('category').value || 'General';
  const reminder = document.getElementById('reminder').value;
  const location = document.getElementById('location').value;
  const notification = document.getElementById('notification').checked;
  const notes = document.getElementById('notes').value;

  const normalizedReminder = reminder ? normalizeReminder(reminder) : null;
  if (reminder && !normalizedReminder) {
    alert('Please enter a valid reminder date and time.');
    return;
  }

  if (normalizedReminder) {
    // Check for exact duplicate name at same time
    const existingSameName = tasks.find(task => 
      task.title.toLowerCase().trim() === title.toLowerCase().trim() && 
      task.reminder && normalizeReminder(task.reminder) === normalizedReminder
    );
    if (existingSameName) {
      alert('A task with this name already exists at this time slot. Please choose a different name or time.');
      return;
    }

    // Check for any overlapping reminders
    const overlapping = tasks.filter((task) => {
      const taskReminder = task.reminder ? normalizeReminder(task.reminder) : null;
      return taskReminder === normalizedReminder;
    });

    if (overlapping.length) {
      // Show conflict modal instead of confirm
      const taskData = { title, category, reminder, location, notification, notes };
      showConflictModal(overlapping, normalizedReminder, taskData);
      return;
    }
  }

  // No conflicts, proceed with adding the task
  const payload = { title, category, reminder, location, notification, notes };
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (response.ok) {
    taskForm.reset();
    await fetchTasks();
  } else {
    const error = await response.json();
    alert(error.error || 'Unable to add task.');
  }
}

async function deleteTask(id) {
  if (!confirm('Delete this task?')) {
    return;
  }

  const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  if (response.ok) {
    await fetchTasks();
  } else {
    alert('Failed to delete task.');
  }
}

async function toggleComplete(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;

  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: !task.completed })
  });

  if (response.ok) {
    await fetchTasks();
  }
}

categoryFilter.addEventListener('change', (event) => {
  currentCategory = event.target.value;
  renderTasks();
});

refreshTasksButton.addEventListener('click', fetchTasks);

taskForm.addEventListener('submit', addTask);

// Modal event listeners
closeModal.addEventListener('click', hideConflictModal);
cancelAdd.addEventListener('click', hideConflictModal);
proceedAnyway.addEventListener('click', () => {
  if (pendingTaskData) {
    proceedWithTask();
  }
});
addSelected.addEventListener('click', () => {
  if (pendingTaskData && !addSelected.disabled) {
    proceedWithTask();
  }
});

// Close modal when clicking outside
conflictModal.addEventListener('click', (event) => {
  if (event.target === conflictModal) {
    hideConflictModal();
  }
});

function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function issueNotification(task) {
  if (!('Notification' in window)) {
    return;
  }
  if (Notification.permission !== 'granted') {
    return;
  }

  new Notification('TODO Reminder', {
    body: `${task.title} ${task.location ? `@ ${task.location}` : ''}`,
    icon: ''
  });
}

function monitorReminders() {
  setInterval(() => {
    const now = Date.now();
    tasks.forEach((task) => {
      if (!task.notification || !task.reminder || task.completed) return;
      const reminderTime = new Date(task.reminder).getTime();
      const hasFired = task.reminderFired;
      if (reminderTime <= now && !hasFired) {
        issueNotification(task);
        task.reminderFired = true;
      }
    });
  }, 30_000);
}

// Modal functions
function showConflictModal(conflictingTasks, originalTime, taskData) {
  pendingTaskData = taskData;
  
  // Show conflict information
  const conflictTime = new Date(originalTime).toLocaleString();
  const conflictNames = conflictingTasks.map(task => task.title).join(', ');
  
  conflictInfo.innerHTML = `
    <p><strong>Conflict detected!</strong></p>
    <p>A task is already scheduled at <strong>${conflictTime}</strong>.</p>
    <p>Existing task(s): <em>${conflictNames}</em></p>
  `;
  
  // Generate suggested time slots
  const suggestions = generateTimeSuggestions(originalTime);
  timeSlots.innerHTML = '';
  
  suggestions.forEach((slot, index) => {
    const button = document.createElement('button');
    button.className = 'time-slot-button';
    button.textContent = `${slot.label}: ${new Date(slot.time).toLocaleString()}`;
    button.onclick = () => selectTimeSlot(button, slot.time);
    timeSlots.appendChild(button);
  });
  
  conflictModal.style.display = 'block';
}

function hideConflictModal() {
  conflictModal.style.display = 'none';
  pendingTaskData = null;
  
  // Clear selections
  document.querySelectorAll('.time-slot-button.selected').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Reset button state
  addSelected.disabled = true;
  addSelected.textContent = 'Add with Selected Time';
}

function generateTimeSuggestions(originalTime) {
  const original = new Date(originalTime);
  const suggestions = [];
  
  // Check 30 min before, 30 min after, 1 hour before, 1 hour after, etc.
  const offsets = [-60, -30, 30, 60, -120, 120]; // minutes
  
  offsets.forEach(offset => {
    const newTime = new Date(original.getTime() + offset * 60000);
    const normalized = normalizeReminder(newTime.toISOString());
    
    // Check if this time slot is available
    const conflicts = tasks.filter(task => {
      const taskTime = task.reminder ? normalizeReminder(task.reminder) : null;
      return taskTime === normalized;
    });
    
    if (conflicts.length === 0) {
      const label = offset < 0 ? `${Math.abs(offset)} min earlier` : `${offset} min later`;
      suggestions.push({ time: newTime.toISOString(), label });
    }
  });
  
  return suggestions.slice(0, 4); // Return up to 4 suggestions
}

function selectTimeSlot(button, newTime) {
  // Clear previous selection
  document.querySelectorAll('.time-slot-button.selected').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Select this button
  button.classList.add('selected');
  
  // Update the pending task data with new time
  if (pendingTaskData) {
    pendingTaskData.reminder = new Date(newTime).toISOString().slice(0, 16); // Format for datetime-local input
  }
  
  // Enable the add button
  addSelected.disabled = false;
  addSelected.textContent = 'Add with Selected Time';
}

async function proceedWithTask() {
  if (!pendingTaskData) return;
  
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pendingTaskData)
  });
  
  if (response.ok) {
    taskForm.reset();
    await fetchTasks();
    hideConflictModal();
  } else {
    const error = await response.json();
    alert(error.error || 'Unable to add task.');
  }
}

window.addEventListener('load', async () => {
  requestNotificationPermission();
  await fetchTasks();
  monitorReminders();
});
