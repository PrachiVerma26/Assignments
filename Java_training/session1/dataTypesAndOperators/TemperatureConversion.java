package session1.dataTypesAndOperators;

import java.util.Scanner;

public class TemperatureConversion {
    private static double celsiusToFahrenheit(int temp){
        return (temp*9.0/5)+32;
    }
    // Fahrenheit to Celsius
    private static double fahrenheitToCelsius(int temp){
        return (temp-32)*5.0/9;
    }

    public static void main(String[] args) {
        Scanner sc=new Scanner(System.in);
        System.out.println("Enter Choice :-  \n"+"1. Celsius to Fahrenheit \n"+ "2. Fahrenheit to Celsius");
        int input= sc.nextInt();
        switch (input){
            case 1: System.out.print("Enter temperature(in Celsius): ");
                int t1=sc.nextInt();
                System.out.println("In Fahrenheit: "+ celsiusToFahrenheit(t1));
                break;
            case 2: System.out.print(" Enter temperature(in Fahrenheit): ");
                int t2=sc.nextInt();
                System.out.println("In Celsius: "+ fahrenheitToCelsius(t2));
                break;
            default:System.out.println("Invalid choice...Try again!");

        }
        sc.close();
    }
}
