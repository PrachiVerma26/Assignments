package session1.controlFlow;

import java.util.Scanner;

public class PrimeChecker {
    private static boolean isPrime(int num){
        if(num <=1) return  false;  //checking -ve numbers
        if(num==2) return true;   //only even prime number
        if (num%2==0) return false; //any even no. >2 is not prime no.

        //check odd divisors upto square-root(num1)
        for(int i=3;i*i<=num;i+=2){
            if(num % i ==0){
                return false;
            }
        }
        return true;
    }
    public static void main(String[] args) {
        Scanner sc=new Scanner(System.in);
        System.out.print( "Enter number: ");
        int n=sc.nextInt();
        if(isPrime(n)){
            System.out.println(n+" is a prime number.");
        }else{
            System.out.println(n+ " is not a prime number.");
        }
        sc.close();
    }

}
