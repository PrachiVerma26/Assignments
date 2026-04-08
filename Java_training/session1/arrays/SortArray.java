package session1.arrays;

import java.util.Arrays;
import java.util.Scanner;

public class SortArray {
    private static void SelectionSort(int[] arr){
        int n=arr.length;
        for(int i=0;i<n-1;i++){
            int minIdx=i;
            for(int j=i+1;j<n;j++){
                if(arr[j]<arr[minIdx]){
                    minIdx=j;
                }
            }
            //swap
            int temp=arr[i];
            arr[i]=arr[minIdx];
            arr[minIdx]=temp;
        }
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
        SelectionSort(arr);
        System.out.println("After sorting: "+ Arrays.toString(arr));
        sc.close();
    }
}
