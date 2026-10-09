const defaultDoctors = [
	{ id: "dr-maya", name: "Dr. Maya Chen", specialty: "Primary Care", qualification: "Family medicine · 12 years", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=700&q=80", position: "50% 30%", slots: "Today, 2:30 PM" },
	{ id: "dr-elena", name: "Dr. Elena Ruiz", specialty: "Cardiology", qualification: "Cardiology · 15 years", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=700&q=80", position: "50% 35%", slots: "Tomorrow, 10:00 AM" },
	{ id: "dr-james", name: "Dr. James Okafor", specialty: "Pediatrics", qualification: "Pediatrics · 10 years", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=700&q=80", position: "50% 30%", slots: "Today, 4:00 PM" },
	{ id: "dr-priya", name: "Dr. Priya Nair", specialty: "Neurology", qualification: "Neurology · 13 years", image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=700&q=80", position: "50% 32%", slots: "Friday, 11:30 AM" }
];

const doctorStorageKey = "harbor-health-doctors";

function loadDoctors() {
	try {
		const savedDoctors = JSON.parse(localStorage.getItem(doctorStorageKey) || "null");
		return Array.isArray(savedDoctors) ? savedDoctors : defaultDoctors;
	} catch {
		return defaultDoctors;
	}
}

const doctors = loadDoctors();

function escapeHtml(value = "") {
	return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

const doctorGrid = document.querySelector("#doctor-grid");
const doctorSearch = document.querySelector("#doctor-search");
const specialtyFilter = document.querySelector("#specialty-filter");
const departmentSelect = document.querySelector("#booking-department");
const bookingDoctor = document.querySelector("#booking-doctor");
const appointmentForm = document.querySelector("#appointment-form");
const bookingDate = document.querySelector("#booking-date");
const formMessage = document.querySelector("#form-message");
const storageKey = "harbor-health-appointments";

function renderDoctors() {
	if (!doctorGrid) return;
	const searchTerm = doctorSearch?.value.trim().toLowerCase() || "";
	const selectedSpecialty = specialtyFilter?.value || "all";
	const matches = doctors.filter((doctor) => {
		const matchesSearch = `${doctor.name} ${doctor.specialty} ${doctor.qualification}`.toLowerCase().includes(searchTerm);
		return matchesSearch && (selectedSpecialty === "all" || doctor.specialty === selectedSpecialty);
	});

	doctorGrid.innerHTML = matches.map((doctor) => `
		<article class="doctor-card">
			<div class="doctor-image"><img src="${escapeHtml(doctor.image || "")}" alt="${escapeHtml(doctor.name)}" style="object-position: ${escapeHtml(doctor.position || "50% 35%")}" loading="lazy"><span class="doctor-availability">Next: ${escapeHtml(doctor.slots || "By request")}</span></div>
			<div class="doctor-info"><span class="doctor-department">${escapeHtml(doctor.specialty)}</span><h3>${escapeHtml(doctor.name)}</h3><p class="doctor-qualification">${escapeHtml(doctor.qualification || doctor.specialty)}</p>
				<div class="doctor-foot"><span>Accepting new patients</span><button type="button" data-doctor="${escapeHtml(doctor.id)}" aria-label="Book with ${escapeHtml(doctor.name)}">↗</button></div>
			</div>
		</article>`).join("");

	const countLabel = document.querySelector("#doctor-count");
	const emptyState = document.querySelector("#doctor-empty");
	if (countLabel) countLabel.textContent = `${matches.length} ${matches.length === 1 ? "specialist" : "specialists"}`;
	if (emptyState) emptyState.hidden = matches.length > 0;
}

function updateDoctorOptions() {
	if (!bookingDoctor || !departmentSelect) return;
	const availableDoctors = doctors.filter((doctor) => doctor.specialty === departmentSelect.value);
	bookingDoctor.innerHTML = '<option value="" disabled selected>Choose a doctor</option>' + availableDoctors.map((doctor) => `<option value="${escapeHtml(doctor.id)}">${escapeHtml(doctor.name)}</option>`).join("");
}

function getAppointments() {
	try {
		const appointments = JSON.parse(localStorage.getItem(storageKey) || "[]");
		return Array.isArray(appointments) ? appointments : [];
	} catch {
		return [];
	}
}

function saveAppointments(appointments) {
	try {
		localStorage.setItem(storageKey, JSON.stringify(appointments));
		return true;
	} catch {
		return false;
	}
}

function showFormMessage(message, isError = false) {
	if (!formMessage) return;
	formMessage.textContent = message;
	formMessage.classList.toggle("error", isError);
}

doctorSearch?.addEventListener("input", renderDoctors);
specialtyFilter?.addEventListener("change", renderDoctors);
departmentSelect?.addEventListener("change", updateDoctorOptions);
if (bookingDate) bookingDate.min = new Date().toISOString().slice(0, 10);
const currentYear = document.querySelector("#current-year");
if (currentYear) currentYear.textContent = new Date().getFullYear();

doctorGrid?.addEventListener("click", (event) => {
	const button = event.target.closest("[data-doctor]");
	if (!button) return;

	const selectedDoctor = doctors.find((doctor) => doctor.id === button.dataset.doctor);
	if (!selectedDoctor) return;
	if (!appointmentForm || !departmentSelect || !bookingDoctor) {
		window.location.href = `appointments.html?doctor=${encodeURIComponent(selectedDoctor.id)}`;
		return;
	}
	departmentSelect.value = selectedDoctor.specialty;
	updateDoctorOptions();
	bookingDoctor.value = selectedDoctor.id;
	document.querySelector("#appointment").scrollIntoView({ behavior: "smooth" });
	document.querySelector("#appointment-form input[name='name']").focus({ preventScroll: true });
	showFormMessage(`You've chosen ${selectedDoctor.name}. Add your details to request a visit.`);
});

appointmentForm?.addEventListener("submit", (event) => {
	event.preventDefault();
	if (!appointmentForm.reportValidity()) return;

	const selectedDoctor = doctors.find((doctor) => doctor.id === bookingDoctor.value);
	if (!selectedDoctor) {
		showFormMessage("Please choose a doctor from the selected care area.", true);
		return;
	}

	const date = new Date(`${bookingDate.value}T00:00:00`);
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	if (date < today) {
		showFormMessage("Please choose today or a future date.", true);
		bookingDate.focus();
		return;
	}

	const appointments = getAppointments();
	const appointment = {
		id: crypto.randomUUID ? crypto.randomUUID() : `visit-${Date.now()}`,
		name: appointmentForm.elements.name.value.trim(),
		email: appointmentForm.elements.email.value.trim().toLowerCase(),
		phone: appointmentForm.elements.phone.value.trim(),
		doctor: selectedDoctor.name,
		specialty: selectedDoctor.specialty,
		date: bookingDate.value,
		time: appointmentForm.elements.time.value,
		notes: appointmentForm.elements.notes.value.trim(),
		status: "Requested"
	};

	appointments.unshift(appointment);
	if (!saveAppointments(appointments)) {
		showFormMessage("Your browser could not save this demo request. Please check its storage settings and try again.", true);
		return;
	}

	showFormMessage(`Request received for ${appointment.date} at ${appointment.time} with ${appointment.doctor}. Our care team will call to confirm.`);
	appointmentForm.reset();
	bookingDoctor.innerHTML = '<option value="" disabled selected>Select care area first</option>';
});

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");

function closeMenu() {
	menuToggle.setAttribute("aria-expanded", "false");
	menuToggle.setAttribute("aria-label", "Open navigation");
	siteNav.classList.remove("is-open");
	document.body.classList.remove("menu-open");
}

menuToggle?.addEventListener("click", () => {
	const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
	menuToggle.setAttribute("aria-expanded", String(!isOpen));
	menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
	siteNav.classList.toggle("is-open", !isOpen);
	document.body.classList.toggle("menu-open", !isOpen);
});

siteNav?.addEventListener("click", (event) => {
	if (event.target.closest("a")) closeMenu();
});

renderDoctors();
