const requestStorageKey = "raksetu-requests";

function readRequestRecords(key) {
	try {
		const records = JSON.parse(localStorage.getItem(key) || "[]");
		return Array.isArray(records) ? records : [];
	} catch {
		return [];
	}
}

function escapeRequestHtml(value = "") {
	return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function showRequestMessage(element, text, isError = false) {
	if (!element) return;
	element.textContent = text;
	element.classList.toggle("error", isError);
}

function currentDateValue() {
	const date = new Date();
	date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
	return date.toISOString().slice(0, 10);
}

function renderRequests() {
	const list = document.querySelector("#blood-request-list");
	if (!list) return;
	const requests = readRequestRecords(requestStorageKey);
	if (!requests.length) {
		list.innerHTML = '<p class="empty-state">No requests have been submitted in this browser yet.</p>';
		return;
	}
	list.innerHTML = requests.map((request) => `<article class="record-card">
		<div><strong>${escapeRequestHtml(request.bloodGroup)} · ${escapeRequestHtml(request.units)} ${Number(request.units) === 1 ? "unit" : "units"}</strong><small>${escapeRequestHtml(request.priority)} priority</small></div>
		<div><strong>${escapeRequestHtml(request.hospital)}</strong><small>${escapeRequestHtml(request.city)}</small></div>
		<div><strong>Needed by ${escapeRequestHtml(request.neededBy)}</strong><small>REQ-${escapeRequestHtml(request.id.slice(-6).toUpperCase())}</small></div>
		<span class="record-status ${escapeRequestHtml((request.status || "Requested").toLowerCase())}">${escapeRequestHtml(request.status || "Requested")}</span>
	</article>`).join("");
}

function initializeRequestForm() {
	const form = document.querySelector("#blood-request-form");
	if (!form) return;
	const message = document.querySelector("#request-form-message");
	const dateInput = form.elements.neededBy;
	dateInput.min = currentDateValue();
	const query = new URLSearchParams(window.location.search);
	const requestedGroup = query.get("group");
	const requestedCity = query.get("city");
	if (requestedGroup && [...form.elements.bloodGroup.options].some((option) => option.value === requestedGroup)) form.elements.bloodGroup.value = requestedGroup;
	if (requestedCity && form.elements.city) form.elements.city.value = requestedCity;

	form.addEventListener("submit", (event) => {
		event.preventDefault();
		if (!form.reportValidity()) return;
		if (dateInput.value < currentDateValue()) {
			showRequestMessage(message, "Choose today or a future date.", true);
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
			localStorage.setItem(requestStorageKey, JSON.stringify([request, ...readRequestRecords(requestStorageKey)]));
		} catch {
			showRequestMessage(message, "Could not save the request in this browser. Check storage settings and try again.", true);
			return;
		}
		showRequestMessage(message, `Request REQ-${request.id.slice(-6).toUpperCase()} saved. A licensed blood bank must confirm stock.`);
		form.reset();
		renderRequests();
		updateRequestMetrics();
	});
+}
+
+function initializeMessageForm() {
+	const form = document.querySelector("#contact-form");
+	if (!form) return;
+	const message = document.querySelector("#contact-message");
+	form.addEventListener("submit", (event) => {
+		event.preventDefault();
+		if (!form.reportValidity()) return;
+		const messages = readRequestRecords("raksetu-messages");
+		messages.unshift({ id: `message-${Date.now()}`, name: form.elements.name.value.trim(), email: form.elements.email.value.trim().toLowerCase(), topic: form.elements.topic.value, message: form.elements.message.value.trim(), createdAt: new Date().toISOString() });
+		try {
+			localStorage.setItem("raksetu-messages", JSON.stringify(messages));
+			showRequestMessage(message, "Thanks for reaching out. Your note is saved in this browser demo.");
+			form.reset();
+		} catch {
+			showRequestMessage(message, "Could not save the note in this browser.", true);
+		}
+	});
+}
+
+function updateRequestMetrics() {
+	const donors = readRequestRecords("raksetu-donors");
+	const requests = readRequestRecords(requestStorageKey);
+	const donorCount = document.querySelector("#impact-donors");
+	const requestCount = document.querySelector("#impact-requests");
+	if (donorCount) donorCount.textContent = donors.length || "248*";
+	if (requestCount) requestCount.textContent = 12 + requests.length;
+}
+
+initializeRequestForm();
+initializeMessageForm();
+renderRequests();
+updateRequestMetrics();
