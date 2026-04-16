function login() {
    const emailInput = document.getElementById('email').value;
    const passInput = document.getElementById('password').value;
    
    const ADMIN_EMAIL = "admin@celeb.com";
    const ADMIN_PASS = "admin123";

    if (!emailInput || !passInput) {
        alert("Please fill in all fields to enter.");
        return;
    }

    if (emailInput === ADMIN_EMAIL && passInput === ADMIN_PASS) {
        localStorage.setItem("currentUserEmail", "admin");
        alert("Login Successful! Welcome, Admin."); 
        window.location.href = "Admin_Interface.html";
        return;
    }

    let users = JSON.parse(localStorage.getItem("allUsers")) || [];
    const user = users.find(u => u.email === emailInput && u.pass === passInput);

    if (user) {
        localStorage.setItem("currentUserEmail", user.email);
        alert(`Login Successful! Welcome back, ${user.name}.`); 
        window.location.href = "Main_Menu.html";
    } else {
        alert("Invalid email or password. Please try again.");
    }
}

function registerAccount() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;
    const age = document.getElementById('regAge').value;
    const birth = document.getElementById('regBirth').value;
    const gender = document.getElementById('regGender').value;

    if (!name || !email || !pass) {
        alert("Please fill in all basic fields!");
        return;
    }

    let users = JSON.parse(localStorage.getItem("allUsers")) || [];

    if (users.some(u => u.email === email)) {
        alert("This email is already registered.");
        return;
    }

    const randomID = Math.floor(1000 + Math.random() * 9000);
    const userTag = `${name.replace(/\s+/g, '')}#${randomID}`;

    const newUser = {
        name: name,
        email: email,
        pass: pass,
        age: age,
        birth: birth,
        gender: gender,
        id: randomID,
        userTag: userTag
    };

    users.push(newUser);
    localStorage.setItem("allUsers", JSON.stringify(users));
    
    alert(`Account Created! Welcome ${name}. Your unique tag is: ${userTag}`);
    window.location.reload();
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

window.onload = function() {
    const currentEmail = localStorage.getItem("currentUserEmail");
    let users = JSON.parse(localStorage.getItem("allUsers")) || [];
    
    const profile = users.find(u => u.email === currentEmail);
    
    if (profile) {
        const fields = {
            'sidePanelName': profile.name,
            'sidePanelID': "#ID-" + profile.id,
            'sidePanelEmail': profile.email,
            'sidePanelAge': profile.age,
            'sidePanelGender': profile.gender,
            'sidePanelBirth': profile.birth,
            'sideName': profile.name,
            'sideEmail': profile.email
        };

        for (let id in fields) {
            if (document.getElementById(id)) {
                document.getElementById(id).innerText = fields[id];
            }
        }
    } else if (window.location.pathname.includes("Main_Menu.html")) {
        window.location.href = "Log_In.html";
    }

    loadFeed();               
    renderNotifications();  
    initCalendar(); 
    if (window.location.pathname.includes("view_event.html")) {
        initViewEvent();
    }
    if (window.location.pathname.includes("View_Event_Details.html")) {
        loadAdminSidebar();
        refreshParticipantView();
    }
};

function executeLogout() {
    localStorage.removeItem("currentUserEmail"); 
    window.location.href = "Log_In.html";
}

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

function addNotification(type, eventHostName, eventTitle) {
    let notifications = JSON.parse(localStorage.getItem("userNotifications")) || [];
    const now = new Date();
    
    const currentEmail = localStorage.getItem("currentUserEmail");
    const users = JSON.parse(localStorage.getItem("allUsers")) || [];
    const currentUser = users.find(u => u.email === currentEmail);
    const currentUserName = currentUser ? currentUser.name : "";

    const isOwner = eventHostName.toLowerCase().trim() === currentUserName.toLowerCase().trim();
    const dynamicTitle = isOwner ? "New Event Created" : "You're Invited!";

    notifications.unshift({
        type: type,
        title: dynamicTitle,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: `Event: ${eventTitle} created by ${eventHostName}.`,
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
        
        const currentEmail = localStorage.getItem("currentUserEmail");
        const users = JSON.parse(localStorage.getItem("allUsers")) || [];
        const currentUser = users.find(u => u.email === currentEmail);
        
        if (!currentUser) {
            alert("Session expired. Please log in again.");
            window.location.href = "Log_In.html";
            return;
        }

        // Integrated Max Plus-Ones retrieval
        let plusOnesVal = parseInt(document.getElementById('maxPlusOnes')?.value || 0);

        const newEvent = {
            id: 'POST-' + Date.now(),
            title: document.getElementById('eventTitle').value,
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            venue: document.getElementById('eventVenue').value,
            address: document.getElementById('eventAddress')?.value || "---", 
            gender: document.getElementById('eventGender').value,
            guestLimit: document.getElementById('guestLimit').value || "No Limit",
            maxPlusOnes: plusOnesVal,
            theme: document.getElementById('eventTheme').value || "None",
            description: document.getElementById('eventDesc').value || "No description provided.",
            type: document.getElementById('eventPrivacy')?.value || 'Public',
            hostName: currentUser.name,    
            hostEmail: currentUser.email,  
            img: document.getElementById('postPreviewImg').src 
        };

        let savedPosts = JSON.parse(localStorage.getItem("userPosts")) || [];
        savedPosts.unshift(newEvent);
        localStorage.setItem("userPosts", JSON.stringify(savedPosts));

        addNotification(newEvent.type, newEvent.hostName, newEvent.title);
        
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
        html += `<div></div>`; 
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const hasEvent = allEvents.some(e => e.date === dateStr);
        
        const dotClass = hasEvent ? 'event-dot border-pink border' : '';

        html += `
            <div class="calendar-day ${dotClass}" 
                  onclick="viewDate('${dateStr}')">
                  ${i}
                  ${hasEvent ? '<span class="position-absolute bottom-0 start-50 translate-middle-x bg-pink rounded-circle" style="width:4px; height:4px; margin-bottom: 5px;"></span>' : ''}
            </div>`;
        
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
        document.getElementById('displayHost').innerText = event.hostName || "allea";
        document.getElementById('displayVenue').innerText = event.venue;
        document.getElementById('displayType').innerText = (event.type || 'Public') + " Event";
        
        const addressEl = document.getElementById('displayAddress');
        if (addressEl) {
            addressEl.innerText = event.address || "---";
        }

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

function loadMyHostedEvents() {
    const container = document.getElementById('myHostedEventsContainer');
    if (!container) return;

    const currentEmail = localStorage.getItem("currentUserEmail");
    const myPosts = JSON.parse(localStorage.getItem("userPosts")) || [];
    
    const personalPosts = myPosts.filter(p => p.hostEmail === currentEmail);

    if (personalPosts.length === 0) {
        container.innerHTML = '<div class="text-center p-4 text-muted small">You haven\'t created any events yet.</div>';
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

function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const output = document.getElementById('postPreviewImg');
        output.src = reader.result;
    };
    if(event.target.files[0]) {
        reader.readAsDataURL(event.target.files[0]);
    }
} 

if (document.getElementById('eventPrivacy')) {
    document.getElementById('eventPrivacy').addEventListener('change', function() {
        const inviteSection = document.getElementById('privateInviteSection');
        if (this.value === 'Private') {
            inviteSection.style.display = 'block';
        } else {
            inviteSection.style.display = 'none';
        }
    });
}

function shareEvent() {
    const eventTitle = document.getElementById('displayTitle').innerText;
    const shareData = {
        title: eventTitle,
        text: `Check out this event: ${eventTitle} on Celeb Search!`,
        url: window.location.href 
    };

    if (navigator.share) {
        navigator.share(shareData)
            .then(() => console.log('Successful share'))
            .catch((error) => console.log('Error sharing', error));
    } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert("Invite link copied to clipboard!");
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    }
}


function loadAdminSidebar() {
    const list = document.getElementById('sidebarEventList');
    if (!list) return;

    const currentEmail = localStorage.getItem("currentUserEmail");
    const myPosts = JSON.parse(localStorage.getItem("userPosts")) || [];
    const personalEvents = myPosts.filter(p => p.hostEmail === currentEmail);

    if (personalEvents.length === 0) {
        list.innerHTML = `<div class="p-4 text-center text-muted small">You haven't created any events.</div>`;
        return;
    }

    const activeId = localStorage.getItem("viewingDetailsId");

    list.innerHTML = personalEvents.map(p => `
        <div class="event-nav-item d-flex align-items-center ${p.id === activeId ? 'active shadow-sm' : ''}" onclick="switchToEvent('${p.id}')">
            <div class="event-icon me-3" style="width: 40px; height: 40px; background: #fff0f2; color: #ff6b81; display: flex; align-items: center; justify-content: center; border-radius: 10px;"><i class="fas fa-star"></i></div>
            <div class="overflow-hidden">
                <h6 class="fw-bold mb-0 text-truncate" style="color: ${p.id === activeId ? '#ff6b81' : '#333'}">${p.title}</h6>
                <small class="text-muted"><i class="fas fa-map-pin me-1"></i> ${p.venue}</small>
            </div>
        </div>
    `).join('');
}

function switchToEvent(id) {
    localStorage.setItem("viewingDetailsId", id);
    loadAdminSidebar(); 
    refreshParticipantView(); 
}

function refreshParticipantView() {
    const eventId = localStorage.getItem("viewingDetailsId");
    const detailView = document.getElementById('detailView');
    const noSelection = document.getElementById('noSelectionMsg');

    if (!eventId) return;

    detailView.style.display = 'block';
    noSelection.style.display = 'none';

    const allPosts = JSON.parse(localStorage.getItem("userPosts")) || [];
    const event = allPosts.find(p => p.id === eventId);
    
    if(event) {
        if(document.getElementById('displayTitle')) document.getElementById('displayTitle').innerText = event.title;
        if(document.getElementById('displayVenue')) document.getElementById('displayVenue').innerText = event.venue;
        if(document.getElementById('displayTime')) document.getElementById('displayTime').innerText = `${event.date} @ ${event.time}`;
        if(document.getElementById('displayAddress')) document.getElementById('displayAddress').innerText = event.address || "No specific address provided";
        
        if(document.getElementById('headerTitle')) document.getElementById('headerTitle').innerText = event.title;
        if(document.getElementById('headerMeta')) document.getElementById('headerMeta').innerText = `${event.date} @ ${event.time} | ${event.venue}`;
    }

    const allRSVPs = JSON.parse(localStorage.getItem("eventRSVPs")) || [];
    const filteredRSVPs = allRSVPs.filter(r => r.eventId === eventId);
    
    const tableBody = document.getElementById('participantTableBody');
    let headcount = 0;

    if (filteredRSVPs.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-muted">No one has RSVP'd yet.</td></tr>`;
        if(document.getElementById('headerTotalHeadcount')) document.getElementById('headerTotalHeadcount').innerText = 0;
        return;
    }

    tableBody.innerHTML = filteredRSVPs.map((p, index) => {
        const extra = parseInt(p.extraGuests || 0);
        headcount += (1 + extra);
        
        const guestNamesHtml = (p.guestNames && p.guestNames.length > 0)
            ? `<div class="guest-folder" id="folder-${index}" style="display:none; background:#fafafa; border:1px dashed #ff6b81; border-radius:12px; padding:10px; margin-top:5px;">
                 <div class="small fw-bold text-pink mb-1"><i class="fas fa-users me-1"></i> Guest List:</div>
                 <div class="small text-muted">${p.guestNames.join(", ")}</div>
               </div>`
            : '';

        return `
            <tr>
                <td class="ps-4">
                    <div class="fw-bold">${p.participantName}</div>
                    <div class="text-muted small">Submitted: ${p.timestamp.split(',')[1]}</div>
                    ${guestNamesHtml}
                </td>
                <td>
                    <span class="badge bg-light text-dark border-0">${p.gender}</span>
                    <span class="ms-1 small text-muted">${p.age} yrs</span>
                </td>
                <td><i class="far fa-clock text-pink me-1"></i> ${p.timestamp.split(',')[1]}</td>
                <td class="fw-bold text-pink">+ ${extra}</td>
                <td class="pe-4 text-end">
                    ${extra > 0 ? `<button class="btn btn-sm btn-outline-pink rounded-pill py-0" onclick="toggleFolder(${index})">View Guests</button>` : ''}
                </td>
            </tr>`;
    }).join('');

    if(document.getElementById('headerTotalHeadcount')) document.getElementById('headerTotalHeadcount').innerText = headcount;
}

function toggleFolder(index) {
    const folder = document.getElementById(`folder-${index}`);
    if (folder) {
        folder.style.display = (folder.style.display === 'block') ? 'none' : 'block';
    }
}