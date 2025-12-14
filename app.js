// Workout data structure
const workoutProgram = {
    monday: [
        'Goblet squat',
        'Hamstring curl',
        'Hip thrust',
        'Bulgarian split',
        'Deadlift',
        'Hanging leg raises'
    ],
    tuesday: [
        'Lat pulldown',
        'Bent over rows',
        'Single arm row',
        'Inclined dumbbell',
        'Prone row',
        'Farmer walk',
        'Pull ups'
    ],
    wednesday: [
        'Boxing',
        'Cardio'
    ],
    thursday: [
        'Sumo squat',
        'Abduction',
        'Hip thrust',
        'Step ups',
        'Deadlift',
        'Hanging leg raise'
    ],
    friday: [
        'Dumbbell bench',
        'Shoulder press',
        'Tricep push down',
        'Lateral raises',
        'Standing cable reverse fly',
        'Farmer walk',
        'Pull ups'
    ],
    saturday: [
        'Leg press',
        'Leg extension',
        'Cable kick backs',
        'Good morning',
        'Adduction',
        'Calves'
    ],
    sunday: []
};

// State management
let currentWeekOffset = 0;
let currentDay = 'monday';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeDateDisplay();
    initializeWeekNavigation();
    initializeDayButtons();
    loadWorkout('monday');
});

// Display current date
function initializeDateDisplay() {
    const dateElement = document.getElementById('currentDate');
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}

// Week navigation
function initializeWeekNavigation() {
    const prevBtn = document.getElementById('prevWeek');
    const nextBtn = document.getElementById('nextWeek');
    
    prevBtn.addEventListener('click', () => {
        currentWeekOffset--;
        updateWeekDisplay();
        loadWorkout(currentDay);
    });
    
    nextBtn.addEventListener('click', () => {
        currentWeekOffset++;
        updateWeekDisplay();
        loadWorkout(currentDay);
    });
    
    updateWeekDisplay();
}

function updateWeekDisplay() {
    const weekDisplay = document.getElementById('weekDisplay');
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1 + (currentWeekOffset * 7)); // Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday
    
    const options = { month: 'short', day: 'numeric' };
    weekDisplay.textContent = `Week of ${weekStart.toLocaleDateString('en-US', options)} - ${weekEnd.toLocaleDateString('en-US', options)}`;
}

// Day selection
function initializeDayButtons() {
    const dayButtons = document.querySelectorAll('.day-btn');
    
    dayButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            dayButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const day = btn.dataset.day;
            currentDay = day;
            loadWorkout(day);
        });
    });
}

// Load workout for selected day
function loadWorkout(day) {
    const container = document.getElementById('workoutContainer');
    const exercises = workoutProgram[day];
    const workoutDate = getDateForDay(day);
    
    if (day === 'sunday') {
        container.innerHTML = `
            <div class="rest-day">
                <div class="rest-day-icon">😴</div>
                <h2>Rest Day</h2>
                <p>Take a break and recover!</p>
                <p class="workout-date">${workoutDate}</p>
            </div>
        `;
        return;
    }
    
    if (day === 'wednesday') {
        container.innerHTML = `
            <div class="cardio-day">
                <div class="workout-header">
                    <h2>Wednesday Workout</h2>
                    <p class="workout-date">${workoutDate}</p>
                </div>
                <div class="cardio-exercises">
                    <div class="cardio-item">🥊 Boxing</div>
                    <div class="cardio-item">🏃 Cardio</div>
                </div>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="workout-header">
            <h2>${day.charAt(0).toUpperCase() + day.slice(1)} Workout</h2>
            <p class="workout-date">${workoutDate}</p>
        </div>
        <div class="exercises-grid">
    `;
    
    exercises.forEach((exercise, index) => {
        const storageKey = getStorageKey(day, index, workoutDate);
        const savedData = getSavedWorkoutData(storageKey);
        
        html += `
            <div class="exercise-card">
                <div class="exercise-name">${exercise}</div>
                <div class="exercise-inputs">
                    <div class="input-group">
                        <label for="${day}-${index}-kg">Kilograms</label>
                        <input type="number" 
                               id="${day}-${index}-kg" 
                               placeholder="0" 
                               step="0.5"
                               value="${savedData.kg}"
                               data-day="${day}" 
                               data-exercise="${index}" 
                               data-field="kg"
                               data-date="${workoutDate}">
                    </div>
                    <div class="input-group">
                        <label for="${day}-${index}-reps">Reps</label>
                        <input type="number" 
                               id="${day}-${index}-reps" 
                               placeholder="0"
                               value="${savedData.reps}"
                               data-day="${day}" 
                               data-exercise="${index}" 
                               data-field="reps"
                               data-date="${workoutDate}">
                    </div>
                    <div class="input-group">
                        <label for="${day}-${index}-sets">Sets</label>
                        <input type="number" 
                               id="${day}-${index}-sets" 
                               placeholder="0"
                               value="${savedData.sets}"
                               data-day="${day}" 
                               data-exercise="${index}" 
                               data-field="sets"
                               data-date="${workoutDate}">
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Add event listeners for inputs
    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', saveWorkoutData);
    });
}

// Get date for specific day in current week
function getDateForDay(day) {
    const dayMap = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 0
    };
    
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const targetDayOfWeek = dayMap[day];
    
    let daysToAdd = targetDayOfWeek - currentDayOfWeek;
    if (currentDayOfWeek === 0) { // Sunday
        daysToAdd = targetDayOfWeek === 0 ? 0 : targetDayOfWeek - 7;
    }
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd + (currentWeekOffset * 7));
    
    return targetDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// Storage key generation
function getStorageKey(day, exerciseIndex, date) {
    return `workout_${day}_${exerciseIndex}_${date}`;
}

// Save workout data to localStorage
function saveWorkoutData(event) {
    const input = event.target;
    const day = input.dataset.day;
    const exercise = input.dataset.exercise;
    const field = input.dataset.field;
    const date = input.dataset.date;
    const value = input.value;
    
    const storageKey = getStorageKey(day, exercise, date);
    let workoutData = JSON.parse(localStorage.getItem(storageKey)) || { kg: '', reps: '', sets: '' };
    workoutData[field] = value;
    
    localStorage.setItem(storageKey, JSON.stringify(workoutData));
}

// Get saved workout data from localStorage
function getSavedWorkoutData(storageKey) {
    const data = localStorage.getItem(storageKey);
    if (data) {
        return JSON.parse(data);
    }
    return { kg: '', reps: '', sets: '' };
}
