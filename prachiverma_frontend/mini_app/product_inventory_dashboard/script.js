//products data
let defaultProducts=[
    {"id": 1,"name": "Laptop","price": 55000,"stock": 5,"category": "Electronics"},
    {"id": 2,"name": "Smartphone","price": 124322,"stock": 10,"category": "Electronics"},
    {"id": 3,"name":"Tablet","price":100000,"stock":3,"category":"Electronics"},

    {"id": 4,"name":"Professional DSLR Camera","price":70000,"stock":20,"category":"Cameras"},

    {"id": 5,"name":"Harry Potter by J.K Rowling","price":4000,"stock":0,"category":"Books"},
    {"id": 6,"name":"The Dreamers by Karen Thompson Walker","price":200,"stock":7,"category":"Books"},
    {"id": 7,"name":"Alchemist by Paulo Coelho","price":4000,"stock":3,"category":"Books"},

    {"id": 8,"name": "Tshirt","price": 149.66,"stock": 25,"category": "Clothing"},
    {"id": 9,"name":"Summer Dress","price":8000,"stock":4,"category":"Clothing"},
    {"id": 10,"name":"Shirts","price":800,"stock":9,"category":"Clothing"},
    {"id": 11,"name":"Trousers","price":1500,"stock":2,"category":"Clothing"},

    {"id":12,"name":"Smartwatch","price":4000,"stock":3,"category":"Watches"},

    {"id": 13,"name":"Chain Necklace","price":200,"stock":3,"category":"Accessories"},
    {"id": 14,"name":"Stone Earings","price":500,"stock":3,"category":"Accessories"},
    {"id": 15,"name":"Gold plated heart shape Ring","price":4000,"stock":2,"category":"Accessories"}
];

let products = defaultProducts;
let selectedCategory="all";
let searchQuery="";
let stockFilter="all";
let sortOption="default";

//pagination variables (bonus)
let currentPage=1;
let itemsPerPage=6;

//Rendered function
function renderProducts() {
    let filtered=getFilteredProducts();
    let grid = document.getElementById("product-grid");
    let paginationDiv = document.getElementById("pagination");
    let pageInfo = document.getElementById("page-info");
    grid.innerHTML = "";
    document.getElementById("loading-state").style.display = "none";
    paginationDiv.innerHTML= "";
    let totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    
    let start=(currentPage-1)*itemsPerPage;
    let paginated=filtered.slice(start,start+itemsPerPage);

    let noResults = document.getElementById("no-results");
    if (filtered.length === 0) {
        noResults.style.display = "block";
    } else {
        noResults.style.display = "none";
    }document.getElementById("count-display").textContent = paginated.length + " of " + filtered.length + " products";
    for (let i = 0; i < paginated.length; i++) {
        let product = paginated[i];
        let card = document.createElement("div");
        card.innerHTML = `
            <h3>${product.name}</h3>
            <p><strong>Price:</strong> Rs ${product.price.toLocaleString("en-IN")}</p>
            <p><strong>Stock:</strong> ${product.stock}</p>
            <button class="btn-delete" data-id="${product.id}">Delete</button>
        `;
        let stockClass = product.stock === 0 ? "badge-out" : product.stock <= 3 ? "badge-low" : "badge-ok";
        let stockLabel = product.stock === 0 ? "Out of Stock" : product.stock <= 3 ? "Low Stock" : "In Stock";
        card.innerHTML = `
        <div class="card-header">
            <span class="category-tag">${product.category}</span>
            <span class="stock-badge ${stockClass}">${stockLabel}</span>
        </div>
        <h3 class="product-name">${product.name}</h3>
        <div class="card-meta">
            <span class="product-price">₹${product.price.toLocaleString("en-IN")}</span>
            <span class="product-stock">Qty: ${product.stock}</span>
        </div>
        <button class="btn-delete" data-id="${product.id}">Delete</button>
        `;
        grid.appendChild(card);
        renderPagination(totalPages);
    }
}
//pagination redner function
// ADD this entire new function after line 66:
function renderPagination(totalPages) {
    let paginationDiv = document.getElementById("pagination");
    let pageInfo = document.getElementById("page-info");
    paginationDiv.innerHTML = "";
    if (totalPages <= 1) { pageInfo.textContent = ""; return; }
    pageInfo.textContent = "Page " + currentPage + " of " + totalPages;

    let prevBtn = document.createElement("button");
    prevBtn.textContent = "← Prev";
    prevBtn.className = "page-btn";
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", function() { currentPage--; renderProducts(); });
    paginationDiv.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        let btn = document.createElement("button");
        btn.textContent = i;
        btn.className = "page-btn" + (i === currentPage ? " active" : "");
        btn.addEventListener("click", (function(page) {
            return function() { currentPage = page; renderProducts(); };
        })(i));
        paginationDiv.appendChild(btn);
    }

    let nextBtn = document.createElement("button");
    nextBtn.textContent = "Next →";
    nextBtn.className = "page-btn";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", function() { currentPage++; renderProducts(); });
    paginationDiv.appendChild(nextBtn);
}
//delete function
function deleteProduct(id) {
    let newList = [];
    for (let i = 0; i < products.length; i++) {
        if (products[i].id !== id) { newList.push(products[i]); }
    }
    products = newList;
    renderProducts();
    updateAnalytics(); // when a product is deleted it shoould be reflected
}
function bindEvents() {
    document.getElementById("search").addEventListener("input",function(e){ //search functionality
        searchQuery=e.target.value.trim();
        currentPage=1;
        renderProducts();
        updateAnalytics();
    });
    // enter key 
    document.getElementById("search").addEventListener("keydown",function(e){
        if(e.key=="Enter"){
            searchQuery=e.target.value.trim();
            currentPage=1;
            renderProducts();
            updateAnalytics();
        }
    });
    document.getElementById("category-filter").addEventListener("change", function(e) {
    selectedCategory = e.target.value;
    currentPage=1;
    renderProducts();
    updateAnalytics();
    });
    document.getElementById("out-of-stock").addEventListener("change", function(e){
    stockFilter = e.target.value;
    renderProducts();
    currentPage=1;
    updateAnalytics();
    });
    document.getElementById("sort-select").addEventListener("change", function(e){
    sortOption = e.target.value;
    currentpage=1;
    renderProducts();
    });
    document.getElementById("product-grid").addEventListener("click", function(e) {
        if (e.target.classList.contains("btn-delete")) {
            deleteProduct(parseInt(e.target.dataset.id));
        }
    });
    document.getElementById("product-form").addEventListener("submit", handleAddProduct);
}

// analysis of products like total products, inventory and out of stock products
function updateAnalytics() {
    let filtered = getFilteredProducts();     
    let total = filtered.length;              
    let totalValue = 0;                        
    for (let i = 0; i < products.length; i++) {
        totalValue += products[i].price * products[i].stock;  
    }
    let outOfStock = 0;                      
    for (let i = 0; i < products.length; i++) {
        if (products[i].stock === 0) { outOfStock++; }
    }
    document.getElementById("total-product").textContent   = total;
    document.getElementById("inventory-value").textContent = "Rs " + totalValue.toLocaleString("en-IN");
    document.getElementById("stock-value").textContent     = outOfStock;
}

//filter products function based on their name
function getFilteredProducts() {
    let result = [];
    for (let i = 0; i < products.length; i++) {
        let matchSearch=products[i].name.toLowerCase().includes(searchQuery.toLowerCase());
        let matchCategory=selectedCategory === "all" || products[i].category.toLowerCase() === selectedCategory;
        let matchStock =stockFilter === "all" ||(stockFilter === "low" && products[i].stock===0);

        if (matchSearch && matchCategory && matchStock) result.push(products[i]);
    }
    //sorting 
    if (sortOption === "price-asc") {
        result.sort((a,b)=>a.price-b.price);
    }
    else if (sortOption === "price-desc") {
        result.sort((a,b)=>b.price-a.price);
    }
    else if (sortOption === "alpha-asc") {
        result.sort((a,b)=>a.name.localeCompare(b.name));
    }
    else if (sortOption === "alpha-dsc") {
        result.sort((a,b)=>b.name.localeCompare(a.name));
    }
    return result;
}

// add new products 
function handleAddProduct(e) {
    e.preventDefault();

    let name = document.getElementById("pname").value.trim();
    let price = parseFloat(document.getElementById("p-price").value);
    let stock = parseInt(document.getElementById("no-stock").value);
    let category = document.getElementById("p-category").value;

    if (!name) return alert("Name required");
    if (price <= 0) return alert("Invalid price");
    if (stock < 0) return alert("Stock cannot be negative");
    if (!category) return alert("Select category");

    let newProduct = {
        id: Date.now(),
        name,
        price,
        stock,
        category
    };

    products.push(newProduct);

    renderProducts();
    updateAnalytics();

    e.target.reset();
}
//category filter added
// ADD this entire function before line 183:
function populateCategoryFilter() {
    let categories = [];
    for (let i = 0; i < products.length; i++) {
        if (categories.indexOf(products[i].category) === -1) {
            categories.push(products[i].category);
        }
    }
    categories.sort();
    let select = document.getElementById("category-filter");
    for (let i = 0; i < categories.length; i++) {
        let opt = document.createElement("option");
        opt.value = categories[i].toLowerCase();
        opt.textContent = categories[i];
        select.appendChild(opt);
    }
}
document.addEventListener("DOMContentLoaded", function() {
    populateCategoryFilter();
    renderProducts();
    bindEvents();      // called once, not inside renderProducts
    updateAnalytics();

     document.getElementById("loading-state").style.display = "block";  

    setTimeout(function() {                                              
        renderProducts();                                                
        updateAnalytics();                                               
    }, 2000);                                                            
});