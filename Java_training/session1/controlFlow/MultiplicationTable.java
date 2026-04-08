//print a multiplication table
package session1.controlFlow;
import java.util.Scanner;

public class MultiplicationTable {
    public static void main(String[] args) {
        Scanner sc=new Scanner(System.in);
        System.out.print("Enter number(for printing it's multiplicative table: ");
        int num=sc.nextInt();
        System.out.println("Multiplicative table of "+ num + " : ");
        for (int i=1;i<=10;i++){
            System.out.println(num + " * " + i + " = "+ (num*i));
        }
        sc.close();
    }
}
