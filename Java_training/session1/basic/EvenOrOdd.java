package session1.basic;
import java.util.Scanner;
public class EvenOrOdd {
    static void isEvenOrOdd(int num) {
        if (num % 2 == 0) {
            System.out.println(num + " is an even number");
        } else {
            System.out.println(num + " is on odd number");
        }
    }
    public static void main(String[] args){
        Scanner sc=new Scanner(System.in);
        System.out.println("Enter Number: ");
        int n=sc.nextInt();
        isEvenOrOdd(n);
        sc.close();
    }
}
