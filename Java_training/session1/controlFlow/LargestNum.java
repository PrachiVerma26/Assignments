package session1.controlFlow;

import java.util.Scanner;
public class LargestNum {
    public static int largest(int num1,int num2, int num3){
        if(num1>=num2 && num1>= num3) return num1;
        else if(num2>=num1 && num2>=num3) return num2;
        else return num3;
    }
    public static void main(String[] args) {
        Scanner sc=new Scanner(System.in);
        System.out.print("Enter first number: ");
        int num1=sc.nextInt();
        System.out.print("Enter second number: ");
        int num2= sc.nextInt();
        System.out.print("Enter third number: ");
        int num3= sc.nextInt();
        System.out.println("Largest Number "+ largest(num1,num2,num3));
        sc.close();
    }
}
