document.addEventListener('DOMContentLoaded', () => {
    const dbPromise = initIndexedDB();

    const exercisesData = [
        { Type: "Category 1 – Plyometrics", Exercise: "Squat Jump to Box" },
        { Type: "Category 1 – Plyometrics", Exercise: "Box Jump (over)" },
        { Type: "Category 2 - Weightlifting", Exercise: "Clean and Jerk" },
        { Type: "Category 2 - Weightlifting", Exercise: "Snatch" },
        { Type: "Category 3 – Power", Exercise: "Kettlebell Swing" },
        { Type: "Category 4 – Legs (Push)", Exercise: "Leg Press" },
        { Type: "Category 4 – Legs (Push)", Exercise: "Lunges" },
        { Type: "Category 5 – Upper Body (Push)", Exercise: "Bench Press" },
        { Type: "Category 5 – Upper Body (Push)", Exercise: "Push-ups" },
        { Type: "Category 6 – Legs (Pull)", Exercise: "Deadlift" },
        { Type: "Category 6 – Legs (Pull)", Exercise: "Hamstring Curl" },
        { Type: "Category 7 – Upper Body (Pull)", Exercise: "Pull-ups" },
        { Type: "Category 7 – Upper Body (Pull)", Exercise: "Rows" },
        { Type: "Category 8 – Hold", Exercise: "Plank" },
        { Type: "Category 9 – Accessory", Exercise: "Calf Raises" },
        { Type: "Category 9 – Accessory", Exercise: "Shoulder Raises" },
        { Type: "Category 11 – Core", Exercise: "Russian Twists" },
        { Type: "Category 11 – Core", Exercise: "Sit-ups" }
    ];

    const repTempos = [
        {
            "Type": "Category 1 – Plyometrics",
            "concentric": "max speed",
            "isometric": "max speed",
            "eccentric": "max speed"
        },
        {
            "Type": "Category 2 - Weightlifting",
            "concentric": "max speed",
            "isometric": "max speed",
            "eccentric": "max speed"
        },
        {
            "Type": "Category 3 – Power",
            "concentric": "max speed",
            "isometric": "max speed",
            "eccentric": "max speed"
        },
        {
            "Type": "Category 4 – Legs (Push)",
            "concentric": "2",
            "isometric": "0",
            "eccentric": "max speed"
        },
        {
            "Type": "Category 5 – Upper Body (Push)",
            "concentric": "max speed",
            "isometric": "0",
            "eccentric": "2"
        },
        {
            "Type": "Category 6 – Legs (Pull)",
            "concentric": "max speed",
            "isometric": "0",
            "eccentric": "2"
        },
        {
            "Type": "Category 7 – Upper Body (Pull)",
            "concentric": "1",
            "isometric": "1",
            "eccentric": "2"
        },
        {
            "Type": "Category 8 – Hold",
            "concentric": "static hold",
            "isometric": "static hold",
            "eccentric": "static hold"
        },
        {
            "Type": "Category 9 – Accessory",
            "concentric": "1",
            "isometric": "1",
            "eccentric": "1"
        },
        {
            "Type": "Category 11 – Core",
            "concentric": "1",
            "isometric": "1",
            "eccentric": "1"
        }
    ];

    const workoutList = document.getElementById('workouts-list');
    const createWorkoutButton = document.getElementById('create-workout');
    const workoutDetails = document.getElementById('workout-details');
    const workoutForm = document.getElementById('workout-form');
    const exerciseCategorySelect = document.getElementById('exercise-category');
    const exerciseNameSelect = document.getElementById('exercise-name');

    createWorkoutButton.addEventListener('click', () => {
        workoutDetails.style.display = 'block';
    });

    workoutForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const db = await dbPromise;

        const name = document.getElementById('name').value;
        const date = document.getElementById('date').value;
        const exercises = [];

        document.querySelectorAll('#exercise-list li').forEach(item => {
            const exercise = {
                name: item.querySelector('.exercise-name').textContent,
                weight: parseFloat(item.querySelector('.exercise-weight').textContent),
                sets: parseInt(item.querySelector('.exercise-sets').textContent),
                reps: parseInt(item.querySelector('.exercise-reps').textContent),
                repTempo: {
                    concentric: item.querySelector('.exercise-concentric').textContent,
                    isometric: item.querySelector('.exercise-isometric').textContent,
                    eccentric: item.querySelector('.exercise-eccentric').textContent
                }
            };
            exercises.push(exercise);
        });

        const workout = {
            name,
            date,
            exercises
        };

        const transaction = db.transaction(['workouts'], 'readwrite');
        const objectStore = transaction.objectStore('workouts');
        objectStore.add(workout);
        await transaction.complete;

        document.getElementById('workout-form').reset();
        workoutDetails.style.display = 'none';
        renderWorkouts();
    });

    document.getElementById('save-workout').addEventListener('click', async () => {
        const db = await dbPromise;
        const transaction = db.transaction(['workouts'], 'readonly');
        const objectStore = transaction.objectStore('workouts');
        const request = objectStore.getAll();
        request.onsuccess = function (event) {
            const workouts = event.target.result;
            workoutList.innerHTML = '';
            workouts.forEach(workout => {
                const listItem = document.createElement('li');
                listItem.textContent = `${workout.name} (${new Date(workout.date).toLocaleDateString()})`;
                listItem.addEventListener('click', () => {
                    showWorkoutDetails(workout);
                });
                workoutList.appendChild(listItem);
            });
        };
    });

    async function initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('workoutApp', 1);

            request.onupgradeneeded = function (event) {
                const db = event.target.result;
                db.createObjectStore('workouts', { keyPath: 'id', autoIncrement: true });
            };

            request.onsuccess = function (event) {
                resolve(event.target.result);
            };

            request.onerror = function (event) {
                reject(event.target.error);
            };
        });
    }

    function populateExerciseCategories() {
        exerciseCategorySelect.innerHTML = '';
        exercisesData.reduce((categories, exercise) => {
            if (!categories.includes(exercise.Type)) {
                categories.push(exercise.Type);
                const option = document.createElement('option');
                option.value = exercise.Type;
                option.textContent = exercise.Type;
                exerciseCategorySelect.appendChild(option);
            }
            return categories;
        }, []);
    }

    function populateExercises(category) {
        exerciseNameSelect.innerHTML = '';
        exercisesData.filter(exercise => exercise.Type === category).forEach(exercise => {
            const option = document.createElement('option');
            option.value = exercise.Exercise;
            option.textContent = exercise.Exercise;
            exerciseNameSelect.appendChild(option);
        });
    }

    function showWorkoutDetails(workout) {
        workoutDetails.style.display = 'block';
        document.getElementById('name').value = workout.name;
        document.getElementById('date').value = workout.date;
        document.getElementById('exercise-list').innerHTML = '';

        workout.exercises.forEach(exercise => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span class="exercise-name">${exercise.name}</span>
                <span class="exercise-weight">${exercise.weight}</span>
                <span class="exercise-sets">${exercise.sets}</span>
                <span class="exercise-reps">${exercise.reps}</span>
                <span class="exercise-concentric">${exercise.repTempo.concentric}</span>
                <span class="exercise-isometric">${exercise.repTempo.isometric}</span>
                <span class="exercise-eccentric">${exercise.repTempo.eccentric}</span>
            `;
            document.getElementById('exercise-list').appendChild(listItem);
        });
    }

    populateExerciseCategories();
    exerciseCategorySelect.addEventListener('change', () => {
        const selectedCategory = exerciseCategorySelect.value;
        populateExercises(selectedCategory);
    });

    function renderWorkouts() {
        document.getElementById('exercise-list').innerHTML = '';
        workouts.forEach(workout => {
            const listItem = document.createElement('li');
            listItem.textContent = `${workout.name} (${new Date(workout.date).toLocaleDateString()})`;
            listItem.addEventListener('click', () => {
                showWorkoutDetails(workout);
            });
            workoutList.appendChild(listItem);
        });
    }
});