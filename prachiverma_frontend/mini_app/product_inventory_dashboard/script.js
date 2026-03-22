//products data
let defaultProducts=[
    {"id": 1,"name": "Laptop","price": 55000,"stock": 5,"category": "Electronics"},
    {"id": 2,"name": "Smartphone","price": 124322,"stock": 10,"category": "Electronics"},
    {"id": 3,"name":"Tablet","price":100000,"stock":3,"category":"Electronics"},

    {"id": 4,"name":"Professional DSLR Camera","price":70000,"stock":20,"category":"Cameras"},

    {"id": 5,"name":"Harry Potter by J.K Rowling","price":4000,"stock":2,"category":"Books"},
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
//Rendered function
function renderProducts() {
    let grid = document.getElementById("product-grid");
    grid.innerHTML = "";
    for (let i = 0; i < products.length; i++) {
        let product = products[i];
        let card = document.createElement("div");
        card.className = "product-card";
        let stockLabel = "";
        if (product.stock === 0) stockLabel = "Out of stock"; 
        else if (product.stock < 5) stockLabel = "Low stock: " + product.stock + " left"; 
        else  stockLabel = "In stock: " + product.stock;
        card.innerHTML = `
            <h3>${product.name}</h3>
            <p><strong>Category:</strong> ${product.category}</p>
            <p><strong>Price:</strong> Rs ${product.price.toLocaleString("en-IN")}</p>
            <p><strong>Stock:</strong> ${stockLabel}</p>
        `;
        grid.appendChild(card);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    renderProducts();
});