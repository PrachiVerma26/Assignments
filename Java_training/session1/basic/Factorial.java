package session1.basic;
import java.util.Scanner;
public class Factorial {
    private static long fact(int num){
        if (num<0){
            System.out.println("Factorial not defined for negative numbers.");
            return -1;
        }
        long result=1;
        for(int i=1;i<=num;i++){
            result*=i;
            System.out.println(result);
        }
        return result;
    }
    public static void main(String[] args){
        Scanner sc=new Scanner(System.in);
        System.out.print("Enter number :  ");
        int n=sc.nextInt();
        System.out.println("Factorial of "+ n+ " : " + fact(n));

    }
}
