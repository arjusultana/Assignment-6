const categoriesContainer = document.getElementById("categories");
const treeCardsContainer = document.getElementById("tree-cards");
const cartList = document.getElementById("cart-list"); 
const totalPriceEl = document.getElementById("total-price"); 
const modal = document.getElementById("plant-modal");
const modalContent = document.getElementById("modal-content");
const spinner = document.getElementById("spinner");


let cart = [];
let allPlants = []; 
let currentCategory = "All Trees"; 

const showSpinner = () => spinner.classList.remove("hidden");
const hideSpinner = () => spinner.classList.add("hidden");

async function loadCategories() {
  showSpinner();
  try {
    const res = await fetch("https://openapi.programming-hero.com/api/categories");
    const data = await res.json();
    console.log("Categories data:", data); 

   
    categoriesContainer.innerHTML = `
      <li><button id="all-btn" onclick="loadAllPlants()" class="w-full text-left bg-green-600 text-white px-3 py-1 rounded active-category">All Trees</button></li>
    `;

    const categories = data.categories || (data.data ? data.data.categories : []);
    categories.forEach(cat => {
      console.log(cat); 
      const categoryName = cat.category || cat.category_name || cat.name;
      const li = document.createElement("li");
      li.innerHTML = `
        <button class="category-btn w-full text-left hover:bg-green-100 px-3 py-1 rounded" onclick="loadCategory('${categoryName.replace(/'/g, "\\'")}')">
          ${categoryName}
        </button>
      `;
      categoriesContainer.appendChild(li);
    });

  } catch (err) {
    console.error("Category fetch error:", err);
  }
  hideSpinner();
}


async function loadAllPlants() {
  showSpinner();
  try {
    const res = await fetch("https://openapi.programming-hero.com/api/plants");
    const data = await res.json();
    console.log("Plants data:", data); 
    allPlants = data.plants || data.data || []; 
    displayPlants(allPlants);
    updateActiveCategory("All Trees");
  } catch (err) {
    console.error("All plants fetch error:", err);
  }
  hideSpinner();
}


async function loadCategory(categoryName) {
  showSpinner();
  try {
    
    if (allPlants.length === 0) {
      const res = await fetch("https://openapi.programming-hero.com/api/plants");
      const data = await res.json();
      allPlants = data.plants || data.data || [];
    }

    const filtered = allPlants.filter(p => p.category === categoryName);
    if (filtered.length > 0) {
      displayPlants(filtered);
    } else {
      treeCardsContainer.innerHTML = `<p class="text-center col-span-3 text-red-600">No plants available in this category.</p>`;
    }
    updateActiveCategory(categoryName);
  } catch (err) {
    console.error("Category plants fetch error:", err);
  }
  hideSpinner();
}


function updateActiveCategory(categoryName) {
  currentCategory = categoryName;
 
  document.querySelectorAll(".category-btn, #all-btn").forEach(btn => {
    btn.classList.remove("bg-green-600", "text-white");
    btn.classList.add("hover:bg-green-100", "text-gray-800", "bg-white");
  });

  const activeBtn = document.querySelector(`button[onclick*="${categoryName}"]`) || document.getElementById("all-btn");
  if (activeBtn) {
    activeBtn.classList.add("bg-green-600", "text-white");
    activeBtn.classList.remove("hover:bg-green-100", "text-gray-800", "bg-white");
  }
}

function displayPlants(plants) {
  treeCardsContainer.innerHTML = "";
  plants.forEach(tree => {
  
    const shortDesc = tree.details ? tree.details.substring(0, 100) + '...' : 'No description available.';
    
    const div = document.createElement("div");
    div.className = "bg-white rounded-lg shadow p-4 text-center hover:shadow-lg transition-shadow";
    div.innerHTML = `
      <img src="${tree.image || 'https://via.placeholder.com/200x150?text=No+Image'}" alt="${tree.name}" class="w-full h-32 object-cover rounded mb-3">
      <!-- Name clickable for modal -->


     <h4 class="text-lg font-bold text-green-700 cursor-pointer hover:underline mb-2" onclick="openModal('${tree._id || tree.id}')">
  ${tree.name}
</h4>

      <p class="text-sm text-gray-600 mb-2">${shortDesc}</p>
      <span class="inline-block mb-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded">${tree.category || 'Uncategorized'}</span>
      <p class="font-bold mb-3 text-green-600">৳${parseFloat(tree.price) || 0}</p>
      <!-- Add to Cart button -->
      <button onclick="addToCart('${tree._id || tree.id}', '${tree.name.replace(/'/g, "\\'")}', ${parseFloat(tree.price) || 0})" 
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full">Add to Cart</button>
    `;
    treeCardsContainer.appendChild(div);
  });
}


async function openModal(plantId) {
  showSpinner();
  try {
    const res = await fetch(`https://openapi.programming-hero.com/api/plant/${plantId}`);
    const data = await res.json();
    const plant = data.data; 

    let nutrientHtml = '<li>No care tips available.</li>';
    if (plant.nutrient && plant.nutrient.length > 0) {
      nutrientHtml = plant.nutrient.map(n => `<li>${n.amount} ${n.name}${n.unit ? ' ' + n.unit : ''}</li>`).join('');
    }

    modalContent.innerHTML = `
      <img src="${plant.image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${plant.name}" class="w-full h-48 object-cover rounded mb-4">
      <h3 class="text-2xl font-bold text-green-700 mb-2">${plant.name}</h3>
      <p class="text-gray-600 mb-2"><strong>Category:</strong> ${plant.category || 'Uncategorized'}</p>
      <p class="text-gray-600 mb-2"><strong>Price:</strong> ৳${parseFloat(plant.price) || 0}</p>
      <p class="text-gray-700 mb-4"><strong>Description:</strong> ${plant.details || 'No details available.'}</p>
      <div class="text-sm mb-4">
        <strong>Care Tips:</strong>
        <ul class="list-disc list-inside text-gray-600 mt-2">${nutrientHtml}</ul>
      </div>
      <button onclick="addToCart('${plantId}', '${plant.name.replace(/'/g, "\\'")}', ${parseFloat(plant.price) || 0})" class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Add to Cart</button>
    `;

    hideSpinner();
      modal.classList.remove("hidden");
    setTimeout(() => modal.classList.remove("translate-x-full"), 10);
 } catch (err) {
    console.error("Modal error:", err);
    hideSpinner();
  }
}


function closeModal() {
  modal.classList.add("translate-x-full"); // slide out
  setTimeout(() => modal.classList.add("hidden"), 300); // animation শেষে hide
}

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});


function addToCart(id, name, price) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price: parseFloat(price), quantity: 1 });
  }
  updateCartDisplay();
  console.log("Added to cart:", cart);
}


function updateCartDisplay() {
  cartList.innerHTML = "";
  let total = 0;
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    const li = document.createElement("li");
    li.className = "flex justify-between items-center bg-white p-2 rounded mb-2";
    li.innerHTML = `
      <span>${item.name} (x${item.quantity}) - ৳${itemTotal}</span>
      <button onclick="removeFromCart('${item.id}')" class="text-red-600 hover:text-red-800 ml-2">❌</button>
    `;
    cartList.appendChild(li);
  });
  totalPriceEl.textContent = total.toFixed(2);
}


function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartDisplay();
}

loadCategories();
loadAllPlants();

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
