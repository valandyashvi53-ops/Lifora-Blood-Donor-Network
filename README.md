# Lifora-Blood-Donor-Network
Lifora is a blood donor network platform designed to connect voluntary blood donors, blood banks, and hospitals through a single community-based system. It helps users explore blood availability, register as donors, and submit blood requests for patients who need support.
# 🩸 Lifora – Blood Donor Network

### Every Drop Connects Us ❤️

This project is developed as a **DBMS Project-Based Learning (PBL)** project, with a focus on blood inventory management, donor registration, and request coordination.

---

## 📌 Project Overview

Lifora aims to simplify blood donation coordination by providing a user-friendly platform where donors and blood banks can connect with people in need.

The website includes a modern landing page, blood availability search, donor registration navigation, blood request forms, and a relational database model demonstrating how donors, donations, inventory units, and hospital requests can be connected.

## ✨ Features

* 🩸 **Blood Availability:** Explore blood inventory by blood group and city.
* ❤️ **Donor Registration:** Navigate to the donor registration page.
* 🏥 **Blood Request Management:** Submit blood requests with hospital, blood group, units, and priority details.
* 🔍 **Search and Filter:** Search blood availability and filter by blood group.
* 🚨 **Urgent Requests:** Highlight urgent and routine blood requirements.
* 📊 **Network Overview:** Display illustrative donor, inventory, and request statistics.
* 🗃️ **Relational Database Model:** Demonstrate relationships between donors, donations, blood units, and requests.
* 📱 **Responsive Design:** Provide a layout designed for different screen sizes.
* 🔐 **Donor Privacy Awareness:** Emphasize responsible handling of donor information.
* 🧭 **Easy Navigation:** Access blood availability, donation centres, mission information, and contact pages.

## 🛠️ Technologies Used

* **HTML5** – Website structure and content.
* **CSS3** – Styling, layout, and responsive design.
* **JavaScript** – Interactive functionality and form handling.
* **Google Fonts** – DM Sans and Manrope typography.
* **Unsplash** – Illustrative images.
* **Git and GitHub** – Version control and project hosting.

## 📂 Project Structure

```text
Lifora/
│
├── index.html
├── login.html
├── register.html
├── appointments.html
├── departments.html
├── doctors.html
├── about.html
├── contact.html
│
├── css/
│   ├── style.css
│   └── responsive.css
│
├── js/
│   ├── bloodbank.js
│   └── appointment.js
│
└── README.md
```

*Note: This structure represents the expected project organization. Update the filenames if your actual repository differs.*

## 🚀 Getting Started

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
```

Replace `YOUR_REPOSITORY_URL` with your actual GitHub repository URL.

### 2. Open the Project Folder

```bash
cd Lifora
```

### 3. Run the Website

Open `index.html` in your browser.

**Important:** The landing page redirects to `login.html` unless the URL contains the `explore` query parameter. To explore the landing page directly, open:

```text
index.html?explore
```

You can also use the Live Server extension in Visual Studio Code for local development.

## 🩸 Blood Request Workflow

1. The requester enters their name and contact number.
2. The requester selects the required blood group and number of units.
3. Hospital or blood bank details are provided.
4. The requester selects the required date and priority.
5. The request form validates the submitted information.
6. The blood bank must independently verify availability and coordinate fulfilment.

## 🗃️ Database Design

The project demonstrates a relational database structure involving four main entities:

| Entity      | Description                                                    |
| ----------- | -------------------------------------------------------------- |
| Donors      | Stores donor information, blood group, and city.               |
| Donations   | Records donation dates and screening details.                  |
| Blood Units | Tracks blood groups, inventory status, and expiry dates.       |
| Requests    | Stores hospital details, required units, and request priority. |

### Relationships

* One donor can make multiple donations.
* One donation can produce multiple inventory records, depending on the database design.
* Blood units can be allocated to eligible requests.
* Hospitals can submit multiple blood requests.

Primary keys and foreign keys can be used to maintain relationships and improve data consistency.

## ⚠️ Important Notes

* The donor counts, stock figures, and request cards currently displayed are illustrative demo data.
* The frontend prototype is not a substitute for a verified blood bank.
* A submitted request does not guarantee blood availability or reserve blood units.
* Contact a registered blood bank or hospital directly for urgent medical requirements.
* Production deployment requires appropriate backend services, database integration, authentication, data validation, and privacy safeguards.

## 🔮 Future Enhancements

* Integrate a database such as MySQL.
* Develop backend APIs for donor and blood inventory management.
* Implement secure donor and administrator authentication.
* Add real-time blood inventory updates.
* Provide location-based donor and blood bank discovery.
* Add request status tracking and notifications.
* Introduce verified blood bank accounts and inventory updates.
* Improve privacy controls and secure handling of personal information.

## 🎯 Project Objective

The main objective of Lifora is to demonstrate how web technologies and database concepts can support blood donation coordination and inventory management through a simple, accessible interface.

## 👩‍💻 Developed As

**Project:** Lifora – Blood Donor Network
**Category:** Web Development / DBMS PBL
**Technologies:** HTML, CSS, JavaScript
**Purpose:** Educational prototype for blood donation coordination

---

### ❤️ Every Drop Connects Us

*Donate responsibly. Connect communities. Help save lives.*
