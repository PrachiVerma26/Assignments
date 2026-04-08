package session1.basic;
import java.util.Scanner;
public class AreaCalculator{
    // 1. for area of circle
    static double AreaOfCircle(double radius){
        return 3.14*radius*radius;
    }

    //2. for area of rectangle
    static double AreaOfRectangle(double length,double width ){
        return length*width;
    }

    //3. for area of triangle
    static double AreaOfTriangle(double base, double height){
        return 0.5*base*height;
    }

    public static void main(String[] args){
        Scanner sc= new Scanner(System.in);
        System.out.println("Calculate Area: \n"+"1. Enter 1 to calculate area for circle \n"+ "2. Enter 2 to calculate area for rectangle \n"+ "3. Enter 3 to calculate area for triangle ");
        int input=sc.nextInt();
        switch (input){
            case 1: System.out.println("Enter radius of circle: ");
                    double r=sc.nextDouble();
                    System.out.println("Area of circle: "+ AreaOfCircle(r));
                    break;
            case 2: System.out.println("Enter length of rectangle: ");
                    double l=sc.nextDouble();
                    System.out.println("enter breadth of rectangle: ");
                    double w=sc.nextDouble();
                    System.out.println("Area of rectangle: "+ AreaOfRectangle(l,w));
                    break;
            case 3: System.out.println("Enter base of triangle: ");
                    double b=sc.nextDouble();
                    System.out.println("Enter height of triangle: ");
                    double h=sc.nextDouble();
                    System.out.println("Area of triangle: "+ AreaOfTriangle(b,h));
                    break;
            default:System.out.println("Invalid choice...try again!");
                    break;
        }
        sc.close();
    }
}
