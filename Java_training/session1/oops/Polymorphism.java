package session1.oops;

//parent class:- fashion-product demonstrating method overloading(compile-time polymorphism)
class FashionProduct {
    // Basic method
    public void showDetails() {
        System.out.println("This is a fashion product");
    }
    // Overloaded method
    public void showDetails(String brand) {
        System.out.println("Brand: " + brand);
    }

}

// child class:-  clothing demonstrating method overriding(run-time polymorphism)
class Clothing extends FashionProduct {

    // Overloaded method (different parameter)
    public void showDetails(String brand, String size) {
        System.out.println("Brand: " + brand + ", Size: " + size);
    }

    // Another variation
    public void showDetails(String brand, String size, double price) {
        System.out.println("Brand: " + brand + ", Size: " + size + ", Price: Rs. " + price);
    }
}
public class Polymorphism {
    public static void main(String[] args) {
        Clothing item = new Clothing();

        item.showDetails();                          // parent method
        item.showDetails("Zara");              // parent overloaded
        item.showDetails("H&M", "M");     // child method
        item.showDetails("Nike", "L", 2999.99);     // child method overriding
    }
}
