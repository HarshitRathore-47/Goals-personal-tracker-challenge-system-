// User name for welcome message
const badgesContainer = document.getElementById('badges');

// Calendar related
const calendarGrid = document.querySelector('#calendarSidebar .calendar-grid');
const calendarMonthYear = document.getElementById('calendarMonthYear');

// App state
let entries = [];
const challengePoints = 40;   // Points per challenge joined
const entryPoints = 12;       // Points per lifestyle entry
let joinedChallenges = new Set();
let earnedBadges = new Set();
let dailyScores = {};

// Healthy form elements
const fitnessForm = document.getElementById('fitnessForm');
const healthyScoreDisplay = document.getElementById('healthyScoreDisplay');
const healthyScoreValue = document.getElementById('healthyScoreValue');
const healthyScoreProgress = document.getElementById('healthyScoreProgress');

// Scoring weight constants
const MAX_SLEEP_HOURS = 10;
const MAX_WATER_LITERS = 4;
const MAX_SCREEN_HOURS = 8;
const MAX_GYM_HOURS = 3;
const MAX_MEALS = 6;
const MAX_FV_SERVINGS = 10;
const MAX_STEPS = 20000;

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Calculate healthy score
function calculateHealthyScore(inputs) {
    let score = 0;

    const sleep = clamp(inputs.sleepHours, 0, MAX_SLEEP_HOURS);
    let sleepScore = 0;
    if (sleep >= 7 && sleep <= 9) {
        sleepScore = 20;
    } else if (sleep < 7) {
        sleepScore = (sleep / 7) * 20;
    } else {
        sleepScore = ((MAX_SLEEP_HOURS - sleep) / (MAX_SLEEP_HOURS - 9)) * 20;
        sleepScore = Math.max(sleepScore, 0);
    }
    score += sleepScore;

    const water = clamp(inputs.waterLiters, 0, MAX_WATER_LITERS);
    const waterScore = (water / 2 >= 1) ? 15 : (water / 2) * 15;
    score += waterScore;

    const screen = clamp(inputs.screenTime, 0, MAX_SCREEN_HOURS);
    let screenScore = 20;
    if (screen <= 2) {
        screenScore = 20;
    } else {
        screenScore = ((MAX_SCREEN_HOURS - screen) / (MAX_SCREEN_HOURS - 2)) * 20;
        screenScore = Math.max(screenScore, 0);
    }
    score += screenScore;

    const gym = clamp(inputs.gymTime, 0, MAX_GYM_HOURS);
    let gymScore = 0;
    if (gym >= 1 && gym <= 2) {
        gymScore = 20;
    } else if (gym < 1) {
        gymScore = (gym / 1) * 20;
    } else {
        gymScore = ((MAX_GYM_HOURS - gym) / (MAX_GYM_HOURS - 2)) * 20;
        gymScore = Math.max(gymScore, 0);
    }
    score += gymScore;

    const meals = clamp(inputs.mealsCount, 0, MAX_MEALS);
    let mealsScore = 0;
    if (meals >= 3 && meals <= 5) {
        mealsScore = 10;
    } else if (meals < 3) {
        mealsScore = (meals / 3) * 10;
    } else {
        mealsScore = ((MAX_MEALS - meals) / (MAX_MEALS - 5)) * 10;
        mealsScore = Math.max(mealsScore, 0);
    }
    score += mealsScore;

    const fv = clamp(inputs.fvServings, 0, MAX_FV_SERVINGS);
    let fvScore = 0;
    if (fv >= 5) {
        fvScore = 15;
    } else {
        fvScore = (fv / 5) * 15;
    }
    score += fvScore;

    const steps = clamp(inputs.stepsWalked, 0, MAX_STEPS);
    const stepsScore = (steps / MAX_STEPS) * 10;
    score += stepsScore;

    return Math.round(clamp(score, 0, 100));
}

// Initialize calendar sidebar for current month
function initCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    calendarMonthYear.textContent = now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0).getDate();

    let startingDay = firstDay.getDay();

    calendarGrid.innerHTML = '';

    for (let i = 0; i < startingDay; i++) {
        const blankCell = document.createElement('div');
        blankCell.className = 'calendar-day';
        calendarGrid.appendChild(blankCell);
    }

    for (let day = 1; day <= lastDate; day++) {
        const date = new Date(year, month, day);
        let dateISO = date.toISOString().split('T')[0];

        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';

        const today = new Date();
        if (
            day === today.getDate()
            && month === today.getMonth()
            && year === today.getFullYear()
        ) {
            dayCell.classList.add('today');
            dayCell.setAttribute('aria-current', 'date');
        }

        const dateNumber = document.createElement('div');
        dateNumber.className = 'date-number';
        dateNumber.textContent = day;
        dayCell.appendChild(dateNumber);

        const dayScoreVal = dailyScores[dateISO] || 0;
        const dayScore = document.createElement('div');
        dayScore.className = 'day-score';
        dayScore.textContent = dayScoreVal > 0 ? dayScoreVal : '';
        dayCell.appendChild(dayScore);

        calendarGrid.appendChild(dayCell);
    }
}

function updateDailyScore(dateISO, value) {
    dailyScores[dateISO] = value;
    renderCalendarScores();
}

function renderCalendarScores() {
    const dayCells = calendarGrid.querySelectorAll('.calendar-day');
    dayCells.forEach(cell => {
        const children = [...cell.children];
        const dateNumberEl = children.find(el => el.classList.contains('date-number'));
        const dayScoreEl = children.find(el => el.classList.contains('day-score'));
        if (!dateNumberEl || !dayScoreEl) return;

        const dateNum = parseInt(dateNumberEl.textContent, 10);
        if (!dateNum) {
            dayScoreEl.textContent = '';
            return;
        }
        const headerText = calendarMonthYear.textContent;
        const date = new Date(headerText + ' ' + dateNum);
        if (isNaN(date)) {
            dayScoreEl.textContent = '';
            return;
        }
       const dateISO = date.toLocaleDateString('en-CA');
        dayScoreEl.textContent = dailyScores[dateISO] && dailyScores[dateISO] > 0 ? dailyScores[dateISO] : '';
    });
}

function getTodayDateISO() {
    return new Date().toISOString().split('T')[0];
}

// Joining challenges logic
document.querySelectorAll('.join-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const challenge = btn.getAttribute('data-challenge');
        if (!joinedChallenges.has(challenge)) {
            joinedChallenges.add(challenge);
            btn.textContent = 'Joined ✓';
            btn.disabled = true;
            btn.classList.remove('bg-blue-700', 'hover:bg-blue-900');
            btn.classList.add('bg-gray-300', 'cursor-default');
            btn.setAttribute('aria-pressed', 'true');

            // Unlock badges for challenges
            if (challenge === 'hydration') {
                addBadge('fa-solid fa-tint', 'Hydration Hero');
            } else if (challenge === 'mindfulness') {
                addBadge('fa-solid fa-spa', 'Mindfulness Master');
            }
        }
    });
});
function renderLogs(logs) {
    const logList = document.getElementById('logList');
    logList.innerHTML = ''; // Clear existing logs

    logs.forEach(log => {
        // Format date nicely, e.g. "Tue, Jun 9, 2025"
        const dateObj = new Date(log.date);
        const formattedDate = dateObj.toLocaleDateString(undefined, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

        // Create a log card container
        const logCard = document.createElement('article');
        logCard.className = 'bg-white rounded-2xl shadow-md p-6 flex flex-col space-y-4';

        // Date and Score header
        logCard.innerHTML = `
      <header class="flex justify-between items-center border-b pb-2 mb-3">
        <time datetime="${log.date}" class="text-gray-700 font-semibold">${formattedDate}</time>
        <span class="text-blue-700 font-bold text-lg">Score: ${log.score} / 100</span>
      </header>
      <div class="grid grid-cols-2 gap-4 text-gray-600">
        <div>💤 <strong>Sleep:</strong> ${log.sleepHours} hrs</div>
        <div>💧 <strong>Water:</strong> ${log.waterLiters} L</div>
        <div>📱 <strong>Screen Time:</strong> ${log.screenTime} hrs</div>
        <div>🏋️ <strong>Gym Time:</strong> ${log.gymTime} hrs</div>
        <div>🍽️ <strong>Meals:</strong> ${log.mealsCount}</div>
        <div>🥦 <strong>Fruits & Veg:</strong> ${log.fvServings} servings</div>
        <div>🚶 <strong>Steps:</strong> ${log.stepsWalked}</div>
      </div>
    `;

        logList.appendChild(logCard);
    });
}
// Add badge with icon and small fixed image
function addBadge(iconClass, description) {
    if (earnedBadges.has(description)) return;
    earnedBadges.add(description);

    const badgeWrapper = document.createElement('div');
    badgeWrapper.className = 'flex flex-col items-center animate-fadeIn';

    const badge = document.createElement('div');
    badge.className = 'badge-realistic relative';

    const imgRibbon = document.createElement('img');
    imgRibbon.src = 'https://cdn-icons-png.flaticon.com/512/616/616408.png';
    imgRibbon.alt = '';
    imgRibbon.className = 'absolute top-2 left-2 w-6 h-6 opacity-90 pointer-events-none select-none';
    badge.appendChild(imgRibbon);

    const icon = document.createElement('i');
    icon.className = iconClass + ' drop-shadow';
    icon.setAttribute('aria-hidden', 'true');
    badge.appendChild(icon);

    badgeWrapper.appendChild(badge);

    const label = document.createElement('div');
    label.className = 'badge-label';
    label.textContent = description;
    badgeWrapper.appendChild(label);

    badgesContainer.appendChild(badgeWrapper);
}

// Initialize calendar and fetch username
initCalendar();



// Form submit
fitnessForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        sleepHours: +document.getElementById('sleepHours').value,
        waterLiters: +document.getElementById('waterLiters').value,
        screenTime: +document.getElementById('screenTime').value,
        gymTime: +document.getElementById('gymTime').value,
        mealsCount: +document.getElementById('mealsCount').value,
        fvServings: +document.getElementById('fvServings').value,
        stepsWalked: +document.getElementById('stepsWalked').value,
    };

    try {
        const res = await fetch('/submit-tracker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();

        if (res.ok) {
            healthyScoreDisplay.classList.remove('hidden');
            healthyScoreValue.textContent = `${result.score} / 100`;
            healthyScoreProgress.style.width = `${result.score}%`;
        } else {
            alert('Failed to save tracker data.');
        }
    } catch (error) {
        alert('Network or server error.');
    }
});

// Fetch latest tracker and history, initialize chart on DOM load
window.addEventListener('DOMContentLoaded', async () => {


    try {
        const res = await fetch('/latest-tracker');
        const data = await res.json();
        fetch('/me')
            .then(res => res.json())
            .then(data => {
                if (data.username) {
                    document.getElementById('username').textContent = data.username;
                }
            });

        if (data.score !== null) {
            healthyScoreDisplay.classList.remove('hidden');
            healthyScoreValue.textContent = `${data.score} / 100`;
            healthyScoreProgress.style.width = `${data.score}%`;
        }
    } catch (err) {
        console.error('Error fetching latest tracker:', err);
    }

    try {
        const resLogs = await fetch('/my-logs');
        const logsData = await resLogs.json();

        if (logsData.success && logsData.logs.length) {
            // Render history list
            const container = document.getElementById('logList');
            container.innerHTML = '';
            logsData.logs.forEach(entry => {
                const div = document.createElement('div');
                const date = new Date(entry.date).toLocaleDateString();
                div.className = 'p-4 bg-gray-100 rounded-xl';
                div.innerHTML = `<strong>${date}</strong> – Score: ${entry.score}`;
                container.appendChild(div);
            });

            // Render chart
            const dates = logsData.logs.map(entry => new Date(entry.date).toLocaleDateString()).reverse();
            const scores = logsData.logs.map(entry => entry.score).reverse();

            const ctx = document.getElementById('scoreChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Health Score',
                        data: scores,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.3,
                        fill: true,
                        pointRadius: 5,
                        pointBackgroundColor: scores.map(score => score >= 80 ? 'green' : score >= 50 ? 'orange' : 'red')
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            title: { display: true, text: 'Score' }
                        },
                        x: {
                            title: { display: true, text: 'Date' }
                        }
                    },
                    plugins: {
                        tooltip: { enabled: true },
                        legend: { display: true }
                    }
                }
            });

            // Render calendar with scores
            dailyScores = {};
            logsData.logs.forEach(log => {
                const dateStr = new Date(log.date).toISOString().slice(0, 10);
                dailyScores[dateStr] = log.score;
            });
            renderCalendarScores();
        }
        renderLogs(sampleLogs);
    } catch (err) {
        console.error('Error loading log history or chart:', err);
    }
});
