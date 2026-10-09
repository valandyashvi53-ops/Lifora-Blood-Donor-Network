const inventoryKey = "raksetu-inventory";
const defaultInventory = [
	{ id: "stock-ap-jaipur", bloodGroup: "A+", units: 18, centre: "City Blood Centre", city: "Jaipur", updatedAt: "Today" },
	{ id: "stock-an-jaipur", bloodGroup: "A-", units: 6, centre: "City Blood Centre", city: "Jaipur", updatedAt: "Today" },
	{ id: "stock-bp-ajmer", bloodGroup: "B+", units: 14, centre: "Sunrise Blood Bank", city: "Ajmer", updatedAt: "Today" },
	{ id: "stock-bn-ajmer", bloodGroup: "B-", units: 4, centre: "Sunrise Blood Bank", city: "Ajmer", updatedAt: "Today" },
	{ id: "stock-abp-ludhiana", bloodGroup: "AB+", units: 7, centre: "Punjab Health Network", city: "Ludhiana", updatedAt: "Today" },
	{ id: "stock-abn-ludhiana", bloodGroup: "AB-", units: 3, centre: "Punjab Health Network", city: "Ludhiana", updatedAt: "Today" },
	{ id: "stock-op-jaipur", bloodGroup: "O+", units: 22, centre: "City Blood Centre", city: "Jaipur", updatedAt: "Today" },
	{ id: "stock-on-ludhiana", bloodGroup: "O-", units: 5, centre: "Punjab Health Network", city: "Ludhiana", updatedAt: "Today" }
];

function readInventory() {
	try {
		const saved = JSON.parse(localStorage.getItem(inventoryKey) || "null");
		return Array.isArray(saved) ? saved : defaultInventory;
	} catch {
		return defaultInventory;
	}
}

function readRecords(key) {
	try {
		const saved = JSON.parse(localStorage.getItem(key) || "[]");
		return Array.isArray(saved) ? saved : [];
	} catch {
		return [];
	}
}

function escapeHtml(value = "") {
	return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function renderInventory() {
	const homeGrid = document.querySelector("#doctor-grid");
	const pageGrid = document.querySelector("#inventory-page-grid");
	const grid = homeGrid || pageGrid;
	if (!grid) return;

	const searchTerm = document.querySelector("#doctor-search")?.value.trim().toLowerCase() || "";
	const selectedGroup = document.querySelector("#specialty-filter")?.value || "all";
	const matches = readInventory().filter((item) => `${item.bloodGroup} ${item.city} ${item.centre}`.toLowerCase().includes(searchTerm)
		&& (selectedGroup === "all" || item.bloodGroup === selectedGroup));
	const maxUnits = Math.max(1, ...readInventory().map((item) => Number(item.units) || 0));
	const cardClass = homeGrid ? "stock-card" : "inventory-card";

	grid.innerHTML = matches.map((item) => {
		const units = Math.max(0, Number(item.units) || 0);
		const fill = Math.min(100, Math.round(units / maxUnits * 100));
		const status = units <= 5 ? "LOW STOCK" : "AVAILABLE";
		const statusClass = units <= 5 ? "low" : "";
		return `<article class="${cardClass}">
			<div class="stock-card-top"><span class="stock-label">${escapeHtml(item.city)} · DEMO</span><span class="stock-status ${statusClass}">${status}</span></div>
			<div class="stock-type">${escapeHtml(item.bloodGroup)}</div>
			<div class="stock-meter" aria-label="${units} demo units"><span style="width:${fill}%"></span></div>
			<div class="stock-meta"><div><strong>${units} units</strong><small>${escapeHtml(item.centre)}</small></div><a href="appointments.html?group=${encodeURIComponent(item.bloodGroup)}&city=${encodeURIComponent(item.city)}">Request ↗</a></div>
		</article>`;
	}).join("");

	const count = document.querySelector("#doctor-count");
	const empty = document.querySelector("#doctor-empty");
	if (count) count.textContent = `${matches.length} ${matches.length === 1 ? "blood group" : "blood groups"}`;
	if (empty) empty.hidden = matches.length > 0;

	const unitTotal = readInventory().reduce((sum, item) => sum + (Number(item.units) || 0), 0);
	const impactUnits = document.querySelector("#impact-units");
	if (impactUnits) impactUnits.textContent = unitTotal;
}

function showFormMessage(element, message, isError = false) {
	if (!element) return;
	element.textContent = message;
	element.classList.toggle("error", isError);
}

function localDateString() {
	const date = new Date();
	date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
	return date.toISOString().slice(0, 10);
}

function renderBloodRequests() {
	const list = document.querySelector("#blood-request-list");
	if (!list) return;
	const requests = readRecords("raksetu-requests");
	if (!requests.length) {
		list.innerHTML = '<p class="empty-state">No requests have been submitted in this browser yet.</p>';
		return;
	}
	list.innerHTML = requests.map((request) => `<article class="record-card">
		<div><strong>${escapeHtml(request.bloodGroup)} · ${escapeHtml(request.units)} ${Number(request.units) === 1 ? "unit" : "units"}</strong><small>${escapeHtml(request.priority)} priority</small></div>
		<div><strong>${escapeHtml(request.hospital)}</strong><small>${escapeHtml(request.city)}</small></div>
		<div><strong>Needed by ${escapeHtml(request.neededBy)}</strong><small>Request ${escapeHtml(request.id.slice(-6).toUpperCase())}</small></div>
		<span class="record-status ${escapeHtml((request.status || "Requested").toLowerCase())}">${escapeHtml(request.status || "Requested")}</span>
	</article>`).join("");
}

function initializeBloodRequestForm() {
	const form = document.querySelector("#blood-request-form");
	if (!form) return;
	const message = document.querySelector("#request-form-message");
	const dateInput = form.elements.neededBy;
	dateInput.min = localDateString();
	const query = new URLSearchParams(window.location.search);
	const requestedGroup = query.get("group");
	const requestedCity = query.get("city");
	if (requestedGroup && [...form.elements.bloodGroup.options].some((option) => option.value === requestedGroup)) form.elements.bloodGroup.value = requestedGroup;
	if (requestedCity && form.elements.city) form.elements.city.value = requestedCity;

	form.addEventListener("submit", (event) => {
		event.preventDefault();
		if (!form.reportValidity()) return;
		if (dateInput.value < localDateString()) {
			showFormMessage(message, "Choose today or a future date.", true);
			dateInput.focus();
			return;
		}
		const request = {
			id: crypto.randomUUID ? crypto.randomUUID() : `request-${Date.now()}`,
			name: form.elements.name.value.trim(),
			phone: form.elements.phone.value.trim(),
			email: form.elements.email?.value.trim().toLowerCase() || "",
			bloodGroup: form.elements.bloodGroup.value,
			units: Number(form.elements.units.value),
			hospital: form.elements.hospital.value.trim(),
			city: form.elements.city.value.trim(),
			neededBy: dateInput.value,
			priority: form.elements.priority.value,
			notes: form.elements.notes.value.trim(),
			status: "Requested",
			createdAt: new Date().toISOString()
		};
		try {
			localStorage.setItem("raksetu-requests", JSON.stringify([request, ...readRecords("raksetu-requests")]));
		} catch {
			showFormMessage(message, "Could not save the demo request in this browser.", true);
			return;
		}
		showFormMessage(message, `Request ${request.id.slice(-6).toUpperCase()} saved. A licensed blood bank must confirm stock and eligibility.`);
		form.reset();
		renderBloodRequests();
		updateImpactMetrics();
	});
}

function initializeContactForm() {
	const form = document.querySelector("#contact-form");
	if (!form) return;
	const message = document.querySelector("#contact-message");
	form.addEventListener("submit", (event) => {
		event.preventDefault();
		if (!form.reportValidity()) return;
		const messages = readRecords("raksetu-messages");
		messages.unshift({ id: `message-${Date.now()}`, name: form.elements.name.value.trim(), email: form.elements.email.value.trim().toLowerCase(), topic: form.elements.topic.value, message: form.elements.message.value.trim(), createdAt: new Date().toISOString() });
		try {
			localStorage.setItem("raksetu-messages", JSON.stringify(messages));
			showFormMessage(message, "Thanks for reaching out. Your message is saved in this browser demo.");
			form.reset();
		} catch {
			showFormMessage(message, "Could not save this message. Please contact a registered blood bank directly.", true);
		}
	});
}

function updateImpactMetrics() {
	const donors = readRecords("raksetu-donors");
	const requests = readRecords("raksetu-requests");
	const donorCount = document.querySelector("#impact-donors");
	const requestCount = document.querySelector("#impact-requests");
	if (donorCount) donorCount.textContent = donors.length ? donors.length : "248*";
	if (requestCount) requestCount.textContent = 12 + requests.length;
}

function initializeSearch() {
	document.querySelector("#doctor-search")?.addEventListener("input", renderInventory);
	document.querySelector("#specialty-filter")?.addEventListener("change", renderInventory);
}

function initializeNavigation() {
	const toggle = document.querySelector(".menu-toggle");
	const nav = document.querySelector("#site-nav");
	if (!toggle || !nav) return;
	toggle.addEventListener("click", () => {
		const isOpen = toggle.getAttribute("aria-expanded") === "true";
		toggle.setAttribute("aria-expanded", String(!isOpen));
		toggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
		nav.classList.toggle("is-open", !isOpen);
		document.body.classList.toggle("menu-open", !isOpen);
	});
	nav.addEventListener("click", (event) => {
		if (!event.target.closest("a")) return;
		toggle.setAttribute("aria-expanded", "false");
		toggle.setAttribute("aria-label", "Open navigation");
		nav.classList.remove("is-open");
		document.body.classList.remove("menu-open");
	});
}

const year = document.querySelector("#current-year");
if (year) year.textContent = new Date().getFullYear();
initializeSearch();
initializeNavigation();
initializeBloodRequestForm();
initializeContactForm();
renderInventory();
renderBloodRequests();
updateImpactMetrics();
