package session1.oops;
//Encapsulation- example
class Employee {

    //here private is used for hiding sensitive information
    private String name;
    private int id;
    private double salary;

    // Constructor
    public Employee(String name, int id, double salary) {
        this.name = name;
        this.id = id;
        setSalary(salary); // using setter for validation
    }

    // Getters
    public String getName() {
        return name;
    }
    public int getId() {
        return id;
    }
    public double getSalary() {
        return salary;
    }

    // Setters
    public void setName(String name) {
        this.name = name;
    }
    public void setId(int id) {
        this.id = id;
    }
    // added validation in the setter itself
    public void setSalary(double salary) {
        if (salary >= 0) {
            this.salary = salary;
        } else {
            System.out.println("Invalid salary!");
        }
    }

    // Method to display details
    public void displayEmployee() {
        System.out.println("Employee Details:");
        System.out.println("Name: " + name);
        System.out.println("ID: " + id);
        System.out.println("Salary: " + salary);
    }
}
public class Encapsulation{
    public static void main(String[] args) {

        Employee emp = new Employee("Prachi", 101, 50000);

        emp.displayEmployee();

        // Trying to update salary
        emp.setSalary(60000);
        System.out.println("Updated Salary: " + emp.getSalary());

        // Invalid update
        emp.setSalary(-1000);
    }
}

