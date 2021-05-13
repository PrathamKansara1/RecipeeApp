const mealsEl = document.getElementById('meals');
const favContainer = document.getElementById('fav-meals');
const SearchTerm = document.getElementById('Search-term');
const SearchBtn = document.getElementById('Search');
const mealInfoEl = document.getElementById('meal-info');
const mealPopup = document.getElementById('meal-popup');
const closePopupBtn = document.getElementById('close-popup');

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const respData = await resp.json();
    const randomMeal = respData.meals[0];

    addMeal(randomMeal, true);
}

async function getMealById(id) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);
    const respData = await resp.json();
    const meal = respData.meals[0];
    return meal;
}

async function getMealsBySearch(term) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term);
    const respData = await resp.json();
    const meal = respData.meals;
    return meal;
}

function addMeal(mealData, random = false) {
    console.log(mealData);

    const meal = document.createElement("div");
    meal.classList.add('meal')

    meal.innerHTML = `
                <div class="meal-header">
                ${random ? `
                <span class="random">
                    Random Recipe
                </span>` : ""}
                    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
                </div>
                <div class="meal-body">
                    <h4>${mealData.strMeal}</h4>
                    <button class="fav-btn">
                        <i class="fas fa-heart "></i>
                    </button>
                </div>
    `;


    const btn = meal.querySelector('.meal-body .fav-btn');
    const mealRecipee = meal.querySelector('.meal-header');
    btn.addEventListener("click", () => {
        if (btn.classList.contains('active')) {
            removeMealsLS(mealData.idMeal);
            btn.classList.remove("active")
        }
        else {
            addMealsLS(mealData.idMeal);
            btn.classList.add("active");
        }
        fetchFavMeals();
    });
    mealRecipee.addEventListener(('click'),()=>{
        showMealInfo(mealData);
    });
    mealsEl.appendChild(meal);
}

function addMealsLS(mealId) {
    const mealIds = getMealsLS();
    localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealsLS(mealId) {
    const mealIds = getMealsLS();
    localStorage.setItem("mealIds", JSON.stringify(mealIds.filter((id) => id !== mealId)));
}

function getMealsLS() {
    const mealIds = JSON.parse(localStorage.getItem("mealIds"));
    return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
    favContainer.innerHTML = "";
    const mealIds = getMealsLS();
    for (i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealById(mealId);
        addMealFav(meal);
    }
}

function addMealFav(mealData) {
    const favMeal = document.createElement('li');

    favMeal.innerHTML = `
        <img src="${mealData.strMealThumb}" class="mealRecipee" alt="${mealData.strMeal}">
        <span class="mealRecipee">${mealData.strMeal}</span>
        <button class="close"><i class="fas fa-window-close"></i></button>
    `;
    const btn = favMeal.querySelector('.close');
    const mealRecipee = favMeal.querySelector('.mealRecipee');

    mealRecipee.addEventListener(('click'),()=>{
        showMealInfo(mealData);
    });

    btn.addEventListener('click', () => {
        removeMealsLS(mealData.idMeal);
        fetchFavMeals();
    });

    favContainer.appendChild(favMeal);
}

function showMealInfo(mealData) {
     mealInfoEl.innerHTML = '';
    const mealEl = document.createElement('div');
    const ingredients = [];
    for(i=1;i<=20;i++){
        if(mealData['strIngredient'+i]){
            ingredients.push(`
                ${mealData["strIngredient" +i]}
                -${mealData["strMeasure"+i]}`
            );
        }else{
            break;
        }
    }
    mealEl.innerHTML = `
                <h1>${mealData.strMeal}</h1>
                <img class="popupImg" src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
                <p>
                    ${mealData.strInstructions}
                </p>
                <h3>Ingredients : </h3>
                <ul>
                    ${ingredients.map((ing) => `
                        <li>${ing}</li>
                    ` ).join("")}
                </ul>
    `
    mealInfoEl.appendChild(mealEl);
    mealPopup.classList.remove('hidden');
}

SearchBtn.addEventListener('click', async () => {
    mealsEl.innerHTML = "";
    const SearchText = SearchTerm.value;
    const meals = await getMealsBySearch(SearchText);
    if (meals) {
        meals.forEach((meal) => {
            addMeal(meal);
        })
    }
})

closePopupBtn.addEventListener(('click'), () => {
    mealPopup.classList.add('hidden');
})