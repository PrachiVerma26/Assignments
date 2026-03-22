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
    {"id": 14,"name":"Stone Earings","price":500,"stock":3,"category":"Acessories"},
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
    grid.innerHTML = "";

    let start=(currentPage-1)*itemsPerPage;
    let paginated=filtered.slice(start,start+itemsPerPage);

    let noResults = document.getElementById("no-results");
    if (filtered.length === 0) {
        noResults.style.display = "block";
    } else {
        noResults.style.display = "none";
    }
    for (let i = 0; i < filtered.length; i++) {
        let product = paginated[i];
        let card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <h3>${product.name}</h3>
            <p><strong>Price:</strong> Rs ${product.price.toLocaleString("en-IN")}</p>
            
        `;
        grid.appendChild(card);
    }
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
    });
    // enter key 
    document.getElementById("search").addEventListener("keydown",function(e){
        if(e.key=="Enter"){
            searchQuery=e.target.value.trim();
            currentPage=1;
            renderProducts();
        }
    });
    document.getElementById("category-filter").addEventListener("change", function(e) {
    selectedCategory = e.target.value;
    renderProducts();
    });
    document.getElementById("out-of-stock").addEventListener("change", function(e){
    stockFilter = e.target.value;
    renderProducts();
    });
    document.getElementById("sort-select").addEventListener("change", function(e){
    sortOption = e.target.value;
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
    let total = products.length;
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
        let matchStock =stockFilter === "all" ||(stockFilter === "low" && products[i].stock < 5);

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
    let price = parseFloat(document.getElementById("pprice").value);
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

document.addEventListener("DOMContentLoaded", function() {
    renderProducts();
    bindEvents();      // called once, not inside renderProducts
    updateAnalytics();
});