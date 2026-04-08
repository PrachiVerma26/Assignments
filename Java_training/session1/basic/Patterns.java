package session1.basic;

import java.util.Scanner;

public class Patterns {
    //triangle pattern
    private static void triangle(int n){
        for (int i=1;i<=n;i++){
            // for printing space
            int space=n-i;
            for(int j=1;j<=space;j++){
                System.out.print(" ");
            }
            //for printing stars
            for (int j = 1; j <= (2 * i - 1); j++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }
    //square pattern
    private static void square(int n){
        for (int i=0;i<n;i++){
            for(int j=0;j<n;j++){
                System.out.print("* ");
            }
            System.out.println();
        }
    }

    public static void main(String[] args) {
        Scanner sc=new Scanner(System.in);
        System.out.println("Enter number :-  \n"+"1. For triangle pattern \n"+ "2. For square pattern ");
        int input= sc.nextInt();
        switch (input){
            case 1: System.out.print("Enter number: ");
                    int n1=sc.nextInt();
                    triangle(n1);
                    break;
            case 2: System.out.print(" Enter number: ");
                    int n2=sc.nextInt();
                    square(n2);
                    break;
            default:System.out.println("Invalid choice...Try again!");

        }
        sc.close();
    }
}
