const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");
const filterTasks = document.getElementById("filterTasks");
const searchTask = document.getElementById("searchTask");
const clearAllBtn = document.getElementById("clearAllBtn");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
const progressPercent = document.getElementById("progressPercent");
const todayDate = document.getElementById("todayDate");

const editId = document.getElementById("editId");
const submitBtn = document.getElementById("submitBtn");

let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];

todayDate.textContent = new Date().toLocaleDateString("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "short",
  year: "numeric"
});

taskForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const title = document.getElementById("taskTitle").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const priority = document.getElementById("priority").value;
  const deadline = document.getElementById("deadline").value;

  if (editId.value) {
    tasks = tasks.map((task) =>
      task.id === Number(editId.value)
        ? { ...task, title, subject, priority, deadline }
        : task
    );

    editId.value = "";
    submitBtn.textContent = "Add Goal";
  } else {
    tasks.push({
      id: Date.now(),
      title,
      subject,
      priority,
      deadline,
      completed: false
    });
  }

  saveTasks();
  taskForm.reset();
  renderTasks();
});

filterTasks.addEventListener("change", renderTasks);
searchTask.addEventListener("input", renderTasks);

clearAllBtn.addEventListener("click", function () {
  if (tasks.length === 0) {
    alert("There are no tasks to clear.");
    return;
  }

  if (confirm("Are you sure you want to delete all goals?")) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
});

function saveTasks() {
  localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";

  const selectedFilter = filterTasks.value;
  const searchValue = searchTask.value.toLowerCase();

  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchValue) ||
        task.subject.toLowerCase().includes(searchValue);

      const matchesFilter =
        selectedFilter === "All" ||
        (selectedFilter === "Pending" && !task.completed) ||
        (selectedFilter === "Completed" && task.completed) ||
        task.priority === selectedFilter;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  emptyMessage.style.display = filteredTasks.length === 0 ? "block" : "none";

  filteredTasks.forEach((task) => {
    const taskItem = document.createElement("article");
    taskItem.className = `task ${task.completed ? "completed" : ""}`;

    taskItem.innerHTML = `
      <input 
        class="task-check"
        type="checkbox"
        ${task.completed ? "checked" : ""}
        onchange="toggleTask(${task.id})"
      />

      <div class="task-info">
        <h4 class="task-title">${escapeHTML(task.title)}</h4>

        <div class="task-meta">
          <span>📘 ${escapeHTML(task.subject)}</span>
          <span>📅 ${formatDate(task.deadline)}</span>
          <span class="badge ${task.priority}">${task.priority}</span>
        </div>
      </div>

      <div class="actions">
        <button class="done-btn" onclick="toggleTask(${task.id})">
          ${task.completed ? "Undo" : "Done"}
        </button>
        <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
        <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;

    taskList.appendChild(taskItem);
  });

  updateStats();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );

  saveTasks();
  renderTasks();
}

function editTask(id) {
  const task = tasks.find((task) => task.id === id);

  document.getElementById("taskTitle").value = task.title;
  document.getElementById("subject").value = task.subject;
  document.getElementById("priority").value = task.priority;
  document.getElementById("deadline").value = task.deadline;

  editId.value = task.id;
  submitBtn.textContent = "Update Goal";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function updateStats() {
  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;
  const progress = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  totalTasks.textContent = tasks.length;
  completedTasks.textContent = completed;
  pendingTasks.textContent = pending;
  progressPercent.textContent = progress;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

renderTasks();