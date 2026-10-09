const appointmentsKey = "harbor-health-appointments";
const patientsKey = "harbor-health-patients";
const doctorsKey = "harbor-health-doctors";
const defaultDoctors = [
	{ id: "dr-maya", name: "Dr. Maya Chen", specialty: "Primary Care", qualification: "Family medicine · 12 years", slots: "Today, 2:30 PM", custom: false },
	{ id: "dr-elena", name: "Dr. Elena Ruiz", specialty: "Cardiology", qualification: "Cardiology · 15 years", slots: "Tomorrow, 10:00 AM", custom: false },
	{ id: "dr-james", name: "Dr. James Okafor", specialty: "Pediatrics", qualification: "Pediatrics · 10 years", slots: "Today, 4:00 PM", custom: false },
	{ id: "dr-priya", name: "Dr. Priya Nair", specialty: "Neurology", qualification: "Neurology · 13 years", slots: "Friday, 11:30 AM", custom: false }
];

function getList(key) {
	try {
		const value = JSON.parse(localStorage.getItem(key) || "[]");
		return Array.isArray(value) ? value : [];
	} catch {
		return [];
	}
}

function setList(key, value) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
		return true;
	} catch {
		return false;
	}
}

function escapeHtml(value = "") {
	return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function getDoctors() {
	const saved = getList(doctorsKey);
	if (saved.length) return saved;
	setList(doctorsKey, defaultDoctors);
	return defaultDoctors;
}

function formatDate(value) {
	if (!value) return "Not set";
	return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function renderStatus(status) {
	const statuses = ["Requested", "Confirmed", "Completed", "Cancelled"];
	return `<select class="status-select" data-status aria-label="Change status">${statuses.map((option) => `<option ${option === status ? "selected" : ""}>${option}</option>`).join("")}</select>`;
}

function renderDashboard() {
	const appointments = getList(appointmentsKey);
	const patients = getList(patientsKey);
	const doctors = getDoctors();
	const statAppointments = document.querySelector("#stat-appointments");
	if (!statAppointments) return;
	const uniquePatientEmails = new Set([...patients.map((patient) => patient.email), ...appointments.map((appointment) => appointment.email)].filter(Boolean));
	statAppointments.textContent = appointments.length;
	document.querySelector("#stat-patients").textContent = Math.max(uniquePatientEmails.size, patients.length);
	document.querySelector("#stat-doctors").textContent = doctors.length;
	document.querySelector("#stat-pending").textContent = appointments.filter((appointment) => (appointment.status || "Requested") === "Requested").length;
	const body = document.querySelector("#recent-appointments");
	const recent = appointments.slice(0, 6);
	body.innerHTML = recent.map((appointment) => `<tr><td><strong>${escapeHtml(appointment.name)}</strong><small>${escapeHtml(appointment.email || appointment.phone)}</small></td><td><strong>${escapeHtml(appointment.doctor)}</strong><small>${escapeHtml(appointment.specialty)}</small></td><td>${escapeHtml(formatDate(appointment.date))}<small>${escapeHtml(appointment.time)}</small></td><td>${renderStatus(appointment.status || "Requested")}</td></tr>`).join("");
	document.querySelector("#recent-empty").hidden = appointments.length > 0;
}

function renderAdminAppointments() {
	const body = document.querySelector("#appointment-admin-list");
	if (!body) return;
	const filter = document.querySelector("#appointment-filter").value;
	const appointments = getList(appointmentsKey);
	const visible = appointments.filter((appointment) => filter === "all" || (appointment.status || "Requested") === filter);
	body.innerHTML = visible.map((appointment) => `<tr>
		<td><strong>${escapeHtml(appointment.name)}</strong><small>${escapeHtml(appointment.email || "No email")}</small></td>
		<td><strong>${escapeHtml(appointment.doctor)}</strong><small>${escapeHtml(appointment.specialty)}</small></td>
		<td>${escapeHtml(formatDate(appointment.date))}<small>${escapeHtml(appointment.time)}</small></td>
		<td>${escapeHtml(appointment.phone)}</td><td>${renderStatus(appointment.status || "Requested")}</td>
		<td><button class="row-action" type="button" data-delete-appointment="${escapeHtml(appointment.id)}">Remove</button></td>
	</tr>`).join("");
	document.querySelector("#appointment-admin-empty").hidden = visible.length > 0;
}

function renderAdminDoctors() {
	const body = document.querySelector("#doctor-admin-list");
	if (!body) return;
	const doctors = getDoctors();
	body.innerHTML = doctors.map((doctor) => `<tr><td><strong>${escapeHtml(doctor.name)}</strong><small>${escapeHtml(doctor.qualification || doctor.specialty)}</small></td><td>${escapeHtml(doctor.specialty)}</td><td>${escapeHtml(doctor.slots || "By request")}</td><td>${doctor.custom ? `<button class="row-action" type="button" data-delete-doctor="${escapeHtml(doctor.id)}">Remove</button>` : '<span class="record-count">Core team</span>'}</td></tr>`).join("");
	document.querySelector("#doctor-admin-count").textContent = `${doctors.length} doctors`;
	document.querySelector("#doctor-admin-empty").hidden = doctors.length > 0;
}

function renderAdminPatients() {
	const body = document.querySelector("#patient-admin-list");
	if (!body) return;
	const registered = getList(patientsKey);
	const appointments = getList(appointmentsKey);
	const patients = new Map();
	registered.forEach((patient) => patients.set(patient.email || patient.id, { ...patient, visits: 0 }));
	appointments.forEach((appointment) => {
		const key = appointment.email || `${appointment.name}-${appointment.phone}`;
		const patient = patients.get(key) || { name: appointment.name, email: appointment.email || "No email", phone: appointment.phone || "Not provided", createdAt: appointment.createdAt, visits: 0 };
		patient.visits += 1;
		patients.set(key, patient);
	});
	const term = document.querySelector("#patient-search").value.trim().toLowerCase();
	const rows = [...patients.values()].filter((patient) => `${patient.name} ${patient.email}`.toLowerCase().includes(term));
	body.innerHTML = rows.map((patient) => `<tr><td><strong>${escapeHtml(patient.name)}</strong><small>${escapeHtml(patient.id || "Appointment record")}</small></td><td>${escapeHtml(patient.email)}</td><td>${escapeHtml(patient.phone || "Not provided")}</td><td>${patient.visits}</td><td>${escapeHtml(patient.createdAt ? formatDate(patient.createdAt.slice(0, 10)) : "—")}</td></tr>`).join("");
	document.querySelector("#patient-admin-count").textContent = `${rows.length} patients`;
	document.querySelector("#patient-admin-empty").hidden = rows.length > 0;
}

document.querySelector("#appointment-filter")?.addEventListener("change", renderAdminAppointments);
document.querySelector("#appointment-admin-list")?.addEventListener("change", (event) => {
	if (!event.target.matches("[data-status]")) return;
	const row = event.target.closest("tr");
	const id = row.querySelector("[data-delete-appointment]")?.dataset.deleteAppointment;
	const appointments = getList(appointmentsKey).map((appointment) => appointment.id === id ? { ...appointment, status: event.target.value } : appointment);
	setList(appointmentsKey, appointments);
	renderAdminAppointments();
	renderDashboard();
});
document.querySelector("#recent-appointments")?.addEventListener("change", (event) => {
	if (!event.target.matches("[data-status]")) return;
	const rowIndex = [...event.currentTarget.rows].indexOf(event.target.closest("tr"));
	const appointments = getList(appointmentsKey);
	if (!appointments[rowIndex]) return;
	appointments[rowIndex] = { ...appointments[rowIndex], status: event.target.value };
	setList(appointmentsKey, appointments);
	renderDashboard();
});
document.querySelector("#appointment-admin-list")?.addEventListener("click", (event) => {
	const button = event.target.closest("[data-delete-appointment]");
	if (!button) return;
	setList(appointmentsKey, getList(appointmentsKey).filter((appointment) => appointment.id !== button.dataset.deleteAppointment));
	renderAdminAppointments();
	renderDashboard();
	renderAdminPatients();
});
document.querySelector("#patient-search")?.addEventListener("input", renderAdminPatients);
document.querySelector("#doctor-form")?.addEventListener("submit", (event) => {
	event.preventDefault();
	const form = event.currentTarget;
	if (!form.reportValidity()) return;
	const doctors = getDoctors();
	const name = form.elements.name.value.trim();
	if (doctors.some((doctor) => doctor.name.toLowerCase() === name.toLowerCase())) {
		form.querySelector("#doctor-admin-message").textContent = "This doctor is already in the directory.";
		return;
	}
	const doctor = { id: `dr-${Date.now()}`, name, specialty: form.elements.specialty.value, qualification: form.elements.qualification.value.trim(), image: form.elements.image.value.trim(), slots: "By request", custom: true };
	if (!setList(doctorsKey, [...doctors, doctor])) {
		form.querySelector("#doctor-admin-message").textContent = "Could not save this doctor in browser storage.";
		return;
	}
	form.reset();
	form.querySelector("#doctor-admin-message").textContent = "Doctor added to the local directory.";
	renderAdminDoctors();
	renderDashboard();
});
document.querySelector("#doctor-admin-list")?.addEventListener("click", (event) => {
	const button = event.target.closest("[data-delete-doctor]");
	if (!button) return;
	setList(doctorsKey, getDoctors().filter((doctor) => doctor.id !== button.dataset.deleteDoctor));
	renderAdminDoctors();
	renderDashboard();
});

renderDashboard();
renderAdminAppointments();
renderAdminDoctors();
renderAdminPatients();
