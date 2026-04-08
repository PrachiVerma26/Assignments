package session1.advance;

// Abstract Class
abstract class Product {
    protected String name;
    protected double price;

    public Product(String name, double price) {
        this.name = name;
        this.price = price;
    }

    // Concrete method
    public void displayBasicInfo() {
        System.out.println("Product: " + name);
        System.out.println("Price: ₹" + price);
    }

    // abstract method
    abstract void applyDiscount();
}
interface Returnable {
    void returnPolicy(); //abstract method
}

//child class
class ElectronicsProduct extends Product implements Returnable {

    public ElectronicsProduct(String name, double price) {
        super(name, price);
    }

    //implementing the apply-discount method of abstract class product
    @Override
    void applyDiscount() {
        double discounted = price * 0.95;
        System.out.println("Electronics Discounted Price: ₹" + discounted);
    }

    //implementing the return-policy method of interface returnable
    @Override
    public void returnPolicy() {
        System.out.println("Return allowed within 7 days");
    }
}
public class AbstractAndInterface {
    public static void main(String[] args) {
    // Electronics Product
    ElectronicsProduct e = new ElectronicsProduct("Headphones", 3000);

        // calling both abstract and interface methods
        e.displayBasicInfo();
        e.applyDiscount();
        e.returnPolicy();
    }
}

