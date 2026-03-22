# Product Inventory Dashboard
A simple and interactive Product Inventory Dashboard built using **HTML, CSS, and JavaScript.
This application allows users to manage products, apply filters, and view real-time inventory analytics.

---
## Features

### Search Functionality
* Search products by name
* Case-insensitive search
* Updates dynamically while typing

### Category Filter
* Filter products by category
* Includes "All Categories" option
* Dynamically updates results

### Stock Filter
* View products with low stock (less than 5)
* Works along with search and category filters

### Sorting Options
* Price: Low to High
* Price: High to Low
* Alphabetically (A-Z)
* Alphabetically (Z-A)

### Inventory Analytics
Displays key metrics:
* Total Products
* Total Inventory Value
* Out of Stock Count

### Product Grid
* Responsive grid layout
* Displays: Product Name, Price, Category and Stock.
* Delete functionality for each product

###  Add Product Form
* Add new products dynamically
* Input validation:
  * Name required
  * Price must be greater than 0
  * Stock cannot be negative
  * Category must be selected
* Updates UI instantly after adding

###  Pagination
* Limits number of products per page
* Improves usability for large datasets

---

## Tech Stack
* **HTML5** – Structure
* **CSS3** – Styling and layout (Flexbox + Grid)
* **JavaScript (Vanilla JS)** – Functionality and DOM manipulation
---

##  Project Structure
```
project-folder/
│
├── index.html
├── styles.css
├── script.js
└── README.md
```

##  How It Works
1. Products are stored in a JavaScript array.
2. Filters (search, category, stock) are applied to generate a filtered list.
3. Sorting is applied to the filtered results.
4. Pagination limits the number of displayed products.
5. The DOM is updated dynamically using JavaScript.


##  UI Layout
```
Header
Controls Section
Analytics Sidebar (Left)
Main Content (Products + Form)
Footer
```
---

##  Developed By
Prachi Verma
