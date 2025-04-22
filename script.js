// Global variables 
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

//  When the page loads  
document.addEventListener("DOMContentLoaded", () => {
  // Update active navigation links 
  updateActiveNav();
  
  const path = window.location.pathname;
  
  if (path.endsWith("index.html") || path === "/") {
    loadRandomMeal();
    setupSearch();
  } else if (path.includes("categories.html")) {
    loadCategories();
  } else if (path.includes("areas.html")) {
    loadAreas();
  } else if (path.includes("favorites.html")) {
    loadFavorites();
  }
  
  setupModalEvents();
});

// Update active nav item
function updateActiveNav() {
  document.querySelectorAll('nav a').forEach(link => {
    link.classList.toggle('active', link.href === window.location.href);
  });
}

// Setup modal events (open/close meal details)
function setupModalEvents() {
  document.getElementById('closeDetails')?.addEventListener('click', () => {
    document.getElementById('mealDetails').classList.add('hidden');
  });
  
  document.getElementById('mealDetails')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('mealDetails')) {
      document.getElementById('mealDetails').classList.add('hidden');
    }
  });
}

// Load a random meal to homepage
async function loadRandomMeal() {
  const container = document.getElementById('randomMeal');
  if (!container) return;

  container.innerHTML = '<div class="loading">جاري تحميل وصفة عشوائية...</div>';
  
  try {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const data = await response.json();
    const meal = data.meals[0];
    
    container.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy">
      <h3>${meal.strMeal}</h3>
      <p>اضغط لعرض التفاصيل</p>
    `;
    
    container.addEventListener('click', () => {
      showMealDetails(meal);
    });
  } catch (error) {
    console.error("Error loading random meal:", error);
    container.innerHTML = '<p class="error">فشل تحميل الوصفة</p>';
  }
}

// Setup search functionality
function setupSearch() {
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  
  if (!searchBtn || !searchInput) return;

  const performSearch = () => {
    const term = searchInput.value.trim();
    if (term) {
      window.location.href = `categories.html?search=${encodeURIComponent(term)}`;
    }
  };
  
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });
}

// Load categories from API
async function loadCategories() {
  const select = document.getElementById('categorySelect');
  if (!select) return;

  select.innerHTML = '<option disabled selected>جاري تحميل التصنيفات...</option>';
  
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('search');
  
  if (searchTerm) {
    searchMeals(searchTerm);
    return;
  }

  try {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list');
    const data = await response.json();
    
    select.innerHTML = '<option disabled selected>اختر تصنيف</option>';
    data.meals.forEach(cat => {
      const option = new Option(cat.strCategory, cat.strCategory);
      select.add(option);
    });
    
    select.addEventListener('change', (e) => {
      fetchCategoryMeals(e.target.value);
    });
  } catch (error) {
    console.error("Error loading categories:", error);
    select.innerHTML = '<option disabled selected>فشل تحميل التصنيفات</option>';
  }
}

// Search for meals by term
async function searchMeals(term) {
  const container = document.getElementById('categoryMeals');
  if (!container) return;

  container.innerHTML = '<div class="loading">جاري البحث عن وصفات...</div>';
  
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`);
    const data = await response.json();
    
    const title = document.querySelector('main h2');
    if (title) title.textContent = `نتائج البحث عن "${term}"`;
    
    container.innerHTML = '';
    
    if (!data.meals) {
      container.innerHTML = `<p class="no-results">لا توجد نتائج لـ "${term}"</p>`;
      return;
    }
    
    data.meals.forEach(meal => {
      container.appendChild(createMealCard(meal));
    });
  } catch (error) {
    console.error("Error searching meals:", error);
    container.innerHTML = '<p class="error">فشل عملية البحث</p>';
  }
}

// Fetch meals by category
async function fetchCategoryMeals(category) {
  const container = document.getElementById('categoryMeals');
  if (!container) return;

  container.innerHTML = '<div class="loading">جاري تحميل الوصفات...</div>';
  
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
    const data = await response.json();
    
    const title = document.querySelector('main h2');
    if (title) title.textContent = `وصفات من تصنيف ${category}`;
    
    container.innerHTML = '';
    
    if (!data.meals) {
      container.innerHTML = `<p class="no-results">لا توجد وصفات في هذا التصنيف</p>`;
      return;
    }
    
    data.meals.forEach(meal => {
      container.appendChild(createMealCard(meal));
    });
  } catch (error) {
    console.error("Error fetching category meals:", error);
    container.innerHTML = '<p class="error">فشل تحميل الوصفات</p>';
  }
}

// Load areas (cuisines)
async function loadAreas() {
  const select = document.getElementById('areaSelect');
  if (!select) return;

  select.innerHTML = '<option disabled selected>جاري تحميل المناطق...</option>';
  
  try {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?a=list');
    const data = await response.json();
    
    select.innerHTML = '<option disabled selected>اختر منطقة</option>';
    data.meals.forEach(area => {
      const option = new Option(area.strArea, area.strArea);
      select.add(option);
    });
    
    select.addEventListener('change', (e) => {
      fetchAreaMeals(e.target.value);
    });
  } catch (error) {
    console.error("Error loading areas:", error);
    select.innerHTML = '<option disabled selected>فشل تحميل المناطق</option>';
  }
}

// Fetch meals by area
async function fetchAreaMeals(area) {
  const container = document.getElementById('areaMeals');
  if (!container) return;

  container.innerHTML = '<div class="loading">جاري تحميل الوصفات...</div>';
  
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`);
    const data = await response.json();
    
    const title = document.querySelector('main h2');
    if (title) title.textContent = `وصفات من منطقة ${area}`;
    
    container.innerHTML = '';
    
    if (!data.meals) {
      container.innerHTML = `<p class="no-results">لا توجد وصفات من هذه المنطقة</p>`;
      return;
    }
    
    data.meals.forEach(meal => {
      container.appendChild(createMealCard(meal));
    });
  } catch (error) {
    console.error("Error fetching area meals:", error);
    container.innerHTML = '<p class="error">فشل تحميل الوصفات</p>';
  }
}

// Create a meal card element
function createMealCard(meal) {
  const card = document.createElement('div');
  card.className = 'meal-card';
  card.innerHTML = `
    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy">
    <h3>${meal.strMeal}</h3>
  `;

  card.addEventListener('click', () => {
    fetchMealDetails(meal.idMeal);
  });

  return card;
}

// Fetch full meal details
async function fetchMealDetails(mealId) {
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
    const data = await response.json();
    if (data.meals && data.meals.length > 0) {
      showMealDetails(data.meals[0]);
    }
  } catch (error) {
    console.error("Error fetching meal details:", error);
    alert('حدث خطأ أثناء جلب تفاصيل الوصفة');
  }
}

// Display full meal details in modal

function showMealDetails(meal) {
  const modal = document.getElementById('mealDetails');
  if (!modal) {
    console.error('Modal element not found!');
    return;
  }

  // Check if all elements are present
  const elements = {
    name: document.getElementById('detailName'),
    img: document.getElementById('detailImg'),
    instructions: document.getElementById('detailInstructions'),
    ingredients: document.getElementById('detailIngredients'),
    favBtn: document.getElementById('addToFav')
  };

  // If any element is missing
  if (Object.values(elements).some(el => !el)) {
    console.error('Missing modal elements!');
    return;
  }

  modal.classList.remove('hidden');
  
  // Fill in the data
  elements.name.textContent = meal.strMeal;
  elements.img.src = meal.strMealThumb;
  elements.instructions.textContent = meal.strInstructions;

  // ingredients
  elements.ingredients.innerHTML = '';
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      const li = document.createElement('li');
      li.textContent = `${ing} - ${meas}`;
      elements.ingredients.appendChild(li);
    }
  }

  // Update the favorites button
  const isFavorite = favorites.some(fav => fav.id === meal.idMeal);
  elements.favBtn.textContent = isFavorite ? '❤️ إزالة من المفضلة' : '❤️ إضافة إلى المفضلة';
  
  // Rebind the event
  const newButton = elements.favBtn.cloneNode(true);
  elements.favBtn.parentNode.replaceChild(newButton, elements.favBtn);
  newButton.addEventListener('click', () => {
    toggleFavorite(meal);
    const newState = favorites.some(fav => fav.id === meal.idMeal);
    newButton.textContent = newState ? '❤️ إزالة من المفضلة' : '❤️ إضافة إلى المفضلة';
  });
}

// ... (بقية الكود يبقى كما هو)

// Add/Remove favorite meals
function toggleFavorite(meal) {
  const existingIndex = favorites.findIndex(fav => fav.id === meal.idMeal);
  
  if (existingIndex === -1) {
    favorites.push({
      id: meal.idMeal,
      name: meal.strMeal,
      img: meal.strMealThumb,
      category: meal.strCategory,
      area: meal.strArea
    });
    alert('تمت الإضافة إلى المفضلة بنجاح!');
  } else {
    favorites.splice(existingIndex, 1);
    alert('تمت الإزالة من المفضلة!');
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
  
  if (document.getElementById('favoriteMeals')) {
    loadFavorites();
  }
}

// Load favorite meals from localStorage
function loadFavorites() {
  const container = document.getElementById('favoriteMeals');
  if (!container) return;

  container.innerHTML = '<div class="loading">جاري تحميل المفضلة...</div>';
  
  if (favorites.length === 0) {
    container.innerHTML = '<p class="no-results">لا توجد وصفات مفضلة بعد</p>';
    return;
  }

  container.innerHTML = '';
  favorites.forEach(fav => {
    const card = document.createElement('div');
    card.className = 'meal-card favorite-card';
    card.innerHTML = `
      <img src="${fav.img}" alt="${fav.name}" loading="lazy">
      <div class="meal-info">
        <h3>${fav.name}</h3>
        <p>${fav.category} • ${fav.area}</p>
        <button class="remove-favorite" data-id="${fav.id}">❌ إزالة</button>
      </div>
    `;
    
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('remove-favorite')) {
        fetchMealDetails(fav.id);
      }
    });

    card.querySelector('.remove-favorite').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite({ idMeal: fav.id, strMeal: fav.name });
    });

    container.appendChild(card);
  });
}