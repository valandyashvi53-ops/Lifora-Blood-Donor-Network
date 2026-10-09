const patientStorageKey = "harbor-health-patients";
const sessionStorageKey = "harbor-health-session";

function readPatients() {
	try {
		const patients = JSON.parse(localStorage.getItem(patientStorageKey) || "[]");
		return Array.isArray(patients) ? patients : [];
	} catch {
		return [];
	}
}

function escapeHtml(value = "") {
	return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

async function hashPassword(password) {
	if (!crypto.subtle) throw new Error("Secure password hashing is not available in this browser.");
	const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
	return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function saveSession(profile) {
	localStorage.setItem(sessionStorageKey, JSON.stringify({ id: profile.id, name: profile.name, email: profile.email, role: profile.role }));
}

function setMessage(element, text, isError = false) {
	if (!element) return;
	element.textContent = text;
	element.classList.toggle("error", isError);
}

const loginForm = document.querySelector("#login-form");
loginForm?.addEventListener("submit", async (event) => {
	event.preventDefault();
	if (!loginForm.reportValidity()) return;
	const email = loginForm.elements.email.value.trim().toLowerCase();
	const password = loginForm.elements.password.value;
	const role = loginForm.elements.role.value;
	const message = document.querySelector("#login-message");

	if (role === "admin" && email === "admin@lifora.demo" && password === "Lifora123!") {
		saveSession({ id: "demo-admin", name: "Lifora admin", email, role: "admin" });
		window.location.href = "admin/dashboard.html";
		return;
	}

	if (role === "patient") {
		try {
			const passwordHash = await hashPassword(password);
			const patient = readPatients().find((item) => item.email === email && item.passwordHash === passwordHash);
			if (patient) {
				saveSession({ ...patient, role: "patient" });
				window.location.href = "patients.html";
				return;
			}
		} catch (error) {
			setMessage(message, error.message, true);
			return;
		}
	}
	setMessage(message, "We couldn't match that account. Check your details or create a patient account.", true);
});

const registerForm = document.querySelector("#register-form");
registerForm?.addEventListener("submit", async (event) => {
	event.preventDefault();
	if (!registerForm.reportValidity()) return;
	const message = document.querySelector("#register-message");
	const email = registerForm.elements.email.value.trim().toLowerCase();
	const patients = readPatients();
	if (patients.some((patient) => patient.email === email)) {
		setMessage(message, "An account with this email already exists. Please sign in instead.", true);
		return;
	}
	if (registerForm.elements.password.value.length < 8) {
		setMessage(message, "Choose a password with at least 8 characters.", true);
		return;
	}

	try {
		const patient = {
			id: crypto.randomUUID ? crypto.randomUUID() : `patient-${Date.now()}`,
			name: registerForm.elements.name.value.trim(),
			email,
			phone: registerForm.elements.phone.value.trim(),
			passwordHash: await hashPassword(registerForm.elements.password.value),
			createdAt: new Date().toISOString()
		};
		localStorage.setItem(patientStorageKey, JSON.stringify([...patients, patient]));
		saveSession({ ...patient, role: "patient" });
		window.location.href = "patients.html";
	} catch {
		setMessage(message, "This browser could not save the account. Please check its storage settings and try again.", true);
	}
});

const profileName = document.querySelector("#patient-name");
if (profileName) {
	let session = null;
	try { session = JSON.parse(localStorage.getItem(sessionStorageKey) || "null"); } catch { session = null; }
	if (session?.role === "patient") {
		profileName.textContent = `Welcome, ${session.name.split(" ")[0]}`;
		document.querySelector("#patient-email").textContent = session.email;
		document.querySelector("#patient-avatar").textContent = session.name.charAt(0).toUpperCase();
		const action = document.querySelector("#patient-account-action");
		action.textContent = "Sign out";
		action.href = "#sign-out";
		action.addEventListener("click", (event) => {
			event.preventDefault();
			localStorage.removeItem(sessionStorageKey);
			window.location.reload();
		});
	} else {
		const action = document.querySelector("#patient-account-action");
		if (action) action.href = "login.html";
	}
}
