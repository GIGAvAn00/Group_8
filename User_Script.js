function login() {
    const user = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    const ADMIN_EMAIL = "admin@celeb.com";
    const ADMIN_PASS = "admin123";

    if (user && email && pass) {
        if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
            window.location.href = "Admin_Interface.html";
        } else {
            window.location.href = "Main_Menu.html";
        }
    } else {
        alert("Please fill in all fields to enter.");
    }
}

function showRegStep(step) {
    if (step === 1) {
        document.getElementById('regStep1').style.display = 'block';
        document.getElementById('regStep2').style.display = 'none';
    } else {
        document.getElementById('regStep2').style.display = 'block';
        document.getElementById('regStep1').style.display = 'none';
    }
}

function registerAccount() {
    const data = {
        name: document.getElementById('regName').value,
        age: document.getElementById('regAge').value,
        birth: document.getElementById('regBirth').value,
        gender: document.getElementById('regGender').value,
        email: document.getElementById('regEmail').value,
        pass: document.getElementById('regPass').value,
        id: Math.floor(1000 + Math.random() * 9000) 
    };

    if (data.name && data.email && data.pass) {
        localStorage.setItem("userProfile", JSON.stringify(data));
        alert("Account Created Successfully!");
        window.location.reload();
    } else {
        alert("Please fill in all fields!");
    }
}




window.onload = function() {
    // 1. Load Profile Data (For Sidebar/Modals)
    const profile = JSON.parse(localStorage.getItem("userProfile"));
    if (profile) {
        if(document.getElementById('sideName')) document.getElementById('sideName').innerText = profile.name;
        if(document.getElementById('sideEmail')) document.getElementById('sideEmail').innerText = profile.email;
        if(document.getElementById('modalName')) document.getElementById('modalName').innerText = profile.name;
        if(document.getElementById('modalEmail')) document.getElementById('modalEmail').innerText = profile.email;
        if(document.getElementById('modalAge')) document.getElementById('modalAge').innerText = profile.age;
        if(document.getElementById('modalGender')) document.getElementById('modalGender').innerText = profile.gender;
        if(document.getElementById('modalBirth')) document.getElementById('modalBirth').innerText = profile.birth;
        if(document.getElementById('modalID')) document.getElementById('modalID').innerText = "ID: #" + profile.id;
    }

    // 2. Initialize Page-Specific Features
    checkInitialInvites();  
    loadFeed();             
    renderNotifications();  
    initCalendar();         
    initViewEvent();        
    loadParticipantData();
    loadMyHostedEvents();
};

function checkInitialInvites() {
    let notifications = JSON.parse(localStorage.getItem("userNotifications")) || [];
    const sarahExists = notifications.some(n => n.message.includes("Sarah Jones"));
    
    if (!sarahExists) {
        notifications.unshift({
            type: 'Public',
            title: "New Invitation Received",
            time: "Just Now",
            message: "Event: Sarah's 21st Bash by Sarah Jones. Celebration on 2026-04-15 at 8:00 PM.",
            status: 'unread'
        });
        localStorage.setItem("userNotifications", JSON.stringify(notifications));
    }
}


function renderNotifications() {
    const list = document.getElementById('notificationList');
    const badge = document.getElementById('notifBadge');
    if (!list) return;

    let notifications = JSON.parse(localStorage.getItem("userNotifications")) || [];
    const activeNotifications = notifications.slice(0, 10);
    const unreadCount = activeNotifications.filter(n => n.status === 'unread').length;

    if (badge) {
        badge.innerText = unreadCount;
        badge.style.display = unreadCount > 0 ? "block" : "none";
    }

    if (activeNotifications.length === 0) {
        list.innerHTML = `<div class="p-4 text-center text-muted small">No new updates</div>`;
        return;
    }

    list.innerHTML = activeNotifications.map((n, index) => `
        <li class="notif-item p-3 border-bottom list-unstyled ${n.status === 'unread' ? 'bg-light' : ''}" id="notif-${index}">
            <div class="d-flex align-items-start">
                <div class="me-3 mt-1"><i class="fas ${getIcon(n.type)} text-pink"></i></div>
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between">
                        <strong class="small d-block ${n.status === 'unread' ? 'text-dark' : 'text-muted'}">${n.title}</strong>
                        <small class="text-muted" style="font-size: 10px;">${n.time}</small>
                    </div>
                    <p class="mb-0 text-muted" style="font-size: 12px;">${n.message}</p>
                    ${n.status === 'unread' ? 
                        `<button class="btn btn-sm text-success p-0 mt-1" onclick="markAsRead(${index})" style="font-size: 10px;">
                            <i class="fas fa-check-double me-1"></i> Mark as Read
                         </button>` : 
                        `<span class="badge bg-secondary mt-1" style="font-size: 9px;">Read</span>`
                    }
                </div>
            </div>
        </li>
    `).join('');
}

function markAsRead(index) {
    let notifications = JSON.parse(localStorage.getItem("userNotifications")) || [];
    notifications[index].status = 'read';
    localStorage.setItem("userNotifications", JSON.stringify(notifications));
    renderNotifications();
}

function markAllAsRead() {
    let notifications = JSON.parse(localStorage.getItem("userNotifications")) || [];
    notifications.forEach(n => n.status = 'read');
    localStorage.setItem("userNotifications", JSON.stringify(notifications));
    renderNotifications();
}

function openArchive() {
    let notifications = JSON.parse(localStorage.getItem("userNotifications")) || [];
    const archived = notifications.slice(10); 
    if (archived.length === 0) {
        alert("No archived notifications yet. Only older notifications (11+) are moved here.");
        return;
    }
    console.log("Archive Data:", archived);
    alert("Viewing " + archived.length + " archived items in console (Stage 1 of Archive Setup).");
}

function addNotification(type, title, message) {
    let notifications = JSON.parse(localStorage.getItem("userNotifications")) || [];
    const now = new Date();
    notifications.unshift({
        type: type,
        title: title,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: message,
        status: 'unread'
    });
    localStorage.setItem("userNotifications", JSON.stringify(notifications));
    renderNotifications();
}


function loadFeed() {
    const feed = document.getElementById('activityFeed');
    if (!feed) return;

    let myPosts = JSON.parse(localStorage.getItem("userPosts")) || [];
    let otherInvites = [
        { 
            id: "991", 
            title: "Sarah's 21st Bash", 
            hostName: "Sarah Jones", 
            venue: "Grand Sky Hotel", 
            date: "2026-04-15", 
            time: "8:00 PM",
            gender: "Female",
            guestLimit: "50",
            theme: "Pink & White",
            description: "Come celebrate my 21st birthday with drinks and dancing!",
            img: "https://images.stockcake.com/public/2/4/1/241780b9-650a-442c-8723-d9f425efd5a2_large/joyful-birthday-party-stockcake.jpg" 
        }
    ];

    const allActivities = [...myPosts, ...otherInvites];

    if (allActivities.length === 0) {
        feed.innerHTML = '<div class="p-4 text-center text-muted small">No activities found.</div>';
        return;
    }

    feed.innerHTML = allActivities.map(p => `
        <div class="activity-card shadow-sm mb-3">
            <div class="d-flex align-items-center p-0">
                <div class="flex-shrink-0" style="width: 140px; height: 100px;">
                    <img src="${p.img}" class="card-event-img h-100 w-100" style="object-fit:cover;">
                </div>
                <div class="flex-grow-1 ms-3 pe-3 py-2">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <h6 class="fw-bold mb-0 text-dark" style="font-size: 0.95rem;">${p.title}</h6>
                        <span class="badge rounded-pill bg-light text-dark border" style="font-size: 10px;">${p.type || 'Public'}</span>
                    </div>
                    <div class="details-inline d-flex flex-wrap gap-2 text-muted mb-2" style="font-size: 0.75rem;">
                        <span><i class="fas fa-user me-1 text-pink"></i> ${p.hostName}</span>
                        <span><i class="fas fa-calendar-alt me-1 text-pink"></i> ${p.date}</span>
                    </div>
                    <button class="btn btn-pink btn-sm w-100 py-1 rounded-pill" onclick="viewFullInvite('${p.id}')">
                        View Invitation
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function viewFullInvite(eventId) {
    localStorage.setItem("selectedEventId", eventId);
    window.location.href = "view_event.html";
}

const postForm = document.getElementById('createPostForm');
if(postForm) {
    postForm.onsubmit = function(e) {
        e.preventDefault();
        const now = new Date();
        const createdTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newEvent = {
            id: 'POST-' + Date.now(),
            title: document.getElementById('eventTitle').value,
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            venue: document.getElementById('eventVenue').value,
            gender: document.getElementById('eventGender').value,
            guestLimit: document.getElementById('guestLimit').value || "No Limit",
            theme: document.getElementById('eventTheme').value || "None",
            description: document.getElementById('eventDesc').value || "No description provided.",
            type: document.getElementById('eventPrivacy')?.value || 'Public',
            hostName: "Me", 
            img: "https://images.stockcake.com/public/2/4/1/241780b9-650a-442c-8723-d9f425efd5a2_large/joyful-birthday-party-stockcake.jpg" 
        };

        let savedPosts = JSON.parse(localStorage.getItem("userPosts")) || [];
        savedPosts.unshift(newEvent);
        localStorage.setItem("userPosts", JSON.stringify(savedPosts));

        addNotification(newEvent.type, "New Event Created", `Event: ${newEvent.title} at ${newEvent.venue}.`);

        alert("Success! Your event has been created.");
        window.location.href = "Main_Menu.html";
    };
}


let currentViewDate = new Date(); 

function initCalendar() {
    const grid = document.getElementById('calendarDaysGrid');
    const monthLabel = document.getElementById('currentMonth');
    if (!grid) return;

    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    monthLabel.innerText = `${monthNames[month]} ${year}`;

    const myPosts = JSON.parse(localStorage.getItem("userPosts")) || [];
    const systemInvites = [{ id: "991", title: "Sarah's 21st Bash", date: "2026-04-15", venue: "Grand Sky Hotel" }];
    const allEvents = [...myPosts, ...systemInvites];

    let html = '';
    for (let x = 0; x < firstDayIndex; x++) {
        html += `<div class="col" style="height:40px;"></div>`;
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const hasEvent = allEvents.some(e => e.date === dateStr);
        const dotClass = hasEvent ? 'position-relative border-pink border' : '';

        html += `
            <div class="col">
                <div class="calendar-day p-1 rounded-circle d-flex align-items-center justify-content-center ${dotClass}" 
                     style="height:40px; cursor:pointer; font-size: 0.9rem;"
                     onclick="viewDate('${dateStr}')">
                     ${i}
                     ${hasEvent ? '<span class="position-absolute bottom-0 start-50 translate-middle-x bg-pink rounded-circle" style="width:4px; height:4px; margin-bottom: 2px;"></span>' : ''}
                </div>
            </div>`;
        
        if ((i + firstDayIndex) % 7 === 0) html += '<div class="w-100"></div>';
    }
    grid.innerHTML = html;
}

function viewDate(dateStr) {
    const detailContainer = document.getElementById('eventDetailsList');
    const myPosts = JSON.parse(localStorage.getItem("userPosts")) || [];
    const systemInvites = [{ id: "991", title: "Sarah's 21st Bash", date: "2026-04-15", venue: "Grand Sky Hotel", time: "8:00 PM" }];
    const allEvents = [...myPosts, ...systemInvites];

    const eventsOnDay = allEvents.filter(e => e.date === dateStr);

    if (eventsOnDay.length === 0) {
        detailContainer.innerHTML = `<p class="text-muted mt-3">No events scheduled for ${dateStr}.</p>`;
        return;
    }

    detailContainer.innerHTML = eventsOnDay.map(e => `
        <div class="p-3 mb-2 rounded-3 bg-light border-start border-pink border-4 shadow-sm">
            <strong class="text-dark d-block">${e.title}</strong>
            <div style="font-size: 11px;">
                <i class="fas fa-clock text-pink me-1"></i> ${e.time || 'All Day'}<br>
                <i class="fas fa-map-marker-alt text-pink me-1"></i> ${e.venue}
            </div>
            <button class="btn btn-sm btn-pink mt-2 w-100 py-1" style="font-size:10px" onclick="viewFullInvite('${e.id}')">View Full Invite</button>
        </div>
    `).join('');
}

function changeMonth(step) {
    currentViewDate.setMonth(currentViewDate.getMonth() + step);
    initCalendar();
}


function executeLogout() {
    localStorage.removeItem("userRole");
    window.location.href = "Log_In.html";
}

const rsvpModal = document.getElementById('acceptModal') ? new bootstrap.Modal(document.getElementById('acceptModal')) : null;

function openAcceptModal(eventId) {
    const invitations = [
        { id: 991, title: "Sarah's 21st Bash", venue: "Grand Sky Hotel", img: "https://images.stockcake.com/public/2/4/1/241780b9-650a-442c-8723-d9f425efd5a2_large/joyful-birthday-party-stockcake.jpg" },
        { id: 992, title: "Poolside Chill", venue: "Sunset Villa", img: "https://images.stockcake.com/public/5/a/0/5a0c9a41-38e9-4e76-80f2-b895e656e9c9_large/poolside-party-fun-stockcake.jpg" }
    ];
    const event = invitations.find(p => p.id == eventId);
    if (event && rsvpModal) {
        document.getElementById('modalEventImg').src = event.img;
        document.getElementById('modalEventTitle').innerText = event.title;
        document.getElementById('modalEventVenue').innerText = event.venue;
        rsvpModal.show();
    }
}

function getIcon(type) {
    switch(type) {
        case 'Public': return 'fa-globe';
        case 'Private': return 'fa-lock';
        case 'Secret': return 'fa-user-secret';
        default: return 'fa-bell';
    }
}


function initViewEvent() {
    const displayTitle = document.getElementById('displayTitle');
    if (!displayTitle) return; 

    const eventId = localStorage.getItem("selectedEventId");
    const myPosts = JSON.parse(localStorage.getItem("userPosts")) || [];
    const otherInvites = [{ 
        id: "991", 
        title: "Sarah's 21st Bash", 
        hostName: "Sarah Jones", 
        venue: "Grand Sky Hotel", 
        date: "2026-04-15", 
        time: "8:00 PM", 
        img: "https://images.stockcake.com/public/2/4/1/241780b9-650a-442c-8723-d9f425efd5a2_large/joyful-birthday-party-stockcake.jpg", 
        gender: "All",
        guestLimit: "No Limit",
        theme: "None",
        description: "No description provided.",
        type: 'Public' 
    }];

    const all = [...myPosts, ...otherInvites];
    const event = all.find(e => e.id == eventId);

    if (event) {
        document.getElementById('displayTitle').innerText = event.title;
        document.getElementById('displayImg').src = event.img || 'https://via.placeholder.com/600x300';
        document.getElementById('displayDate').innerText = event.date;
        document.getElementById('displayTime').innerText = event.time || 'TBD';
        document.getElementById('displayHost').innerText = event.hostName || "Me";
        document.getElementById('displayVenue').innerText = event.venue;
        document.getElementById('displayType').innerText = (event.type || 'Public') + " Event";
        if(document.getElementById('displayGender')) document.getElementById('displayGender').innerText = event.gender || "All";
        if(document.getElementById('displayLimit')) document.getElementById('displayLimit').innerText = event.guestLimit || "No Limit";
        if(document.getElementById('displayTheme')) document.getElementById('displayTheme').innerText = event.theme || "None";
        if(document.getElementById('displayDesc')) document.getElementById('displayDesc').innerText = event.description || "No description provided.";
    }
}

function generateGuestInputs() {
    const count = document.getElementById('guestCount').value;
    const container = document.getElementById('guestNameList');
    container.innerHTML = ''; 
    for(let i = 1; i <= count; i++) {
        container.innerHTML += `
            <div class="col-md-6">
                <div class="p-2 border rounded-4 bg-light">
                    <label class="form-label small mb-1 px-2">Guest ${i} Name</label>
                    <input type="text" class="form-control border-0 bg-transparent" placeholder="Full Name" required>
                </div>
            </div>`;
    }
}

function updateGuestNames() {
    const container = document.getElementById('guestListContainer');
    const count = document.getElementById('guestCountInput').value;
    container.innerHTML = '';
    for(let i=1; i<=count; i++) {
        container.innerHTML += `
            <div class="col-12">
                <input type="text" class="form-control rounded-pill p-2 mt-1" placeholder="Guest ${i} Name">
            </div>`;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const declineForm = document.getElementById('declineForm');
    if(declineForm) {
        declineForm.onsubmit = function(e) {
            e.preventDefault();
            alert("We've sent your response to the host.");
            window.location.href = "Main_Menu.html";
        };
    }
});


const rsvpFinalForm = document.getElementById('rsvpFinalForm');
if (rsvpFinalForm) {
    rsvpFinalForm.onsubmit = function(e) {
        e.preventDefault();
        const eventId = localStorage.getItem("selectedEventId");
        
        const participantData = {
            eventId: eventId,
            participantName: rsvpFinalForm.querySelector('input[placeholder="Full Name"]').value,
            gender: rsvpFinalForm.querySelector('select').value,
            age: rsvpFinalForm.querySelector('input[type="number"]').value,
            extraGuests: document.getElementById('guestCountInput')?.value || 0,
            status: "Accepted",
            timestamp: new Date().toLocaleString()
        };

        const guestNames = [];
        const guestInputs = document.querySelectorAll('#guestListContainer input');
        guestInputs.forEach(input => {
            if(input.value.trim() !== "") guestNames.push(input.value.trim());
        });
        participantData.guestNames = guestNames;

        let allRSVPs = JSON.parse(localStorage.getItem("eventRSVPs")) || [];
        allRSVPs.push(participantData);
        localStorage.setItem("eventRSVPs", JSON.stringify(allRSVPs));

        alert("RSVP Successful! You have been added to the guest list.");
        window.location.href = "Main_Menu.html";
    };
}

function adminViewDetails(id) {
    localStorage.setItem("viewingDetailsId", id);
    window.location.href = "View_Event_Details.html"; 
}

function loadParticipantData() {
    const tableBody = document.getElementById('participantTableBody');
    if (!tableBody) return;

    const eventId = localStorage.getItem("selectedEventId") || localStorage.getItem("viewingDetailsId");
    const allRSVPs = JSON.parse(localStorage.getItem("eventRSVPs")) || [];
    const eventParticipants = allRSVPs.filter(rsvp => rsvp.eventId === eventId);

    if (eventParticipants.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No participants have RSVP'd yet.</td></tr>`;
        return;
    }

    tableBody.innerHTML = eventParticipants.map(p => {
        const guestsText = p.guestNames && p.guestNames.length > 0 
            ? `<br><small class="text-pink">Guests: ${p.guestNames.join(", ")}</small>` 
            : '';

        return `
            <tr>
                <td class="ps-4">
                    <div class="fw-bold">${p.participantName}</div>
                    <div class="text-muted small">ID: #${Math.floor(100 + Math.random() * 900)}</div>
                </td>
                <td><span class="badge bg-light text-dark border-0">${p.gender}</span></td>
                <td>${p.age}</td>
                <td>
                    <span class="fw-bold text-pink">${p.extraGuests}</span>
                    ${guestsText}
                </td>
                <td><i class="far fa-clock me-1 text-muted"></i> ${p.timestamp.split(',')[1]}</td>
                <td class="pe-4"><span class="badge bg-soft-pink text-pink">${p.status}</span></td>
            </tr>`;
    }).join('');
}

/* ==========================================
 * FILTERED HOSTED EVENTS
 * ========================================== */
function loadMyHostedEvents() {
    const container = document.getElementById('myHostedEventsContainer');
    if (!container) return;

    const myPosts = JSON.parse(localStorage.getItem("userPosts")) || [];
    const personalPosts = myPosts.filter(p => p.hostName === "Me");

    if (personalPosts.length === 0) {
        container.innerHTML = '<p class="text-muted small">You haven\'t created any events yet.</p>';
        return;
    }

    container.innerHTML = personalPosts.map(p => `
        <div class="card mb-3 border-0 shadow-sm rounded-4">
            <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="fw-bold mb-0">${p.title}</h6>
                    <small class="text-muted">${p.date} | ${p.venue}</small>
                </div>
                <button class="btn btn-pink btn-sm rounded-pill" onclick="adminViewDetails('${p.id}')">
                    Manage Guest List
                </button>
            </div>
        </div>
    `).join('');
}