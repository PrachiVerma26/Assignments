package session1.arrays;

import java.util.Scanner;

public class AverageArray {
    private static double calAverage(int[] arr){
        if(arr == null || arr.length==0){
            return 0;
        }
        long sum=0;
        for(int num : arr){
            sum+=num;
        }
        return (double) sum /arr.length;
    }

    public static void main(String[] args) {
        Scanner sc=new Scanner(System.in);
        System.out.println("Enter the number of elements in the array : ");
        int n=sc.nextInt();
        if (n<=0) {
            System.out.println("Enter a positive number.");
            return;
        }
        int [] arr=new int[n];
        System.out.println("Enter array elements: ");
        for(int i=0;i<n;i++){
            arr[i]=sc.nextInt();
        }
        double avg=calAverage(arr);
        System.out.println("Average: "+ avg);
        sc.close();
    }
}
