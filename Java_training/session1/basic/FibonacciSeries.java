package session1.basic;
import java.util.Scanner;
public class FibonacciSeries {
    private static void fibonacci(int num){
        int prev=0,curr=1;
        System.out.print(prev + " " + curr + " " );
        for (int i=2;i<num;i++){
            int next=prev+curr;
            System.out.print(next + " ");
            prev=curr;
            curr=next;
        }
    }
    public static void main(String[] args) {
        Scanner sc=new Scanner(System.in);
        System.out.print("Enter number : ");
        int n= sc.nextInt();
        fibonacci(n);
    }
}
