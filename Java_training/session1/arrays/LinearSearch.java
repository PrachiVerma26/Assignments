package session1.arrays;

import java.util.Scanner;

public class LinearSearch {
    public static int linearSearch(int[] arr, int key){
        for(int i=0; i<arr.length;i++) {
            if (arr[i] == key) {
                return i; //element index found
            }
        }
        return -1; // element not found
    }
    public static void main(String[] args) {
        Scanner sc=new Scanner(System.in);

        // input array size
        System.out.println("Enter the number of elements in the array : ");
        int n=sc.nextInt();
        if (n<=0) {
            System.out.print("Enter a positive number.");
            return;
        }
        int [] arr=new int[n];
        //input array elements
        System.out.println("Enter array elements: ");
        for(int i=0;i<n;i++){
            arr[i]=sc.nextInt();
        }

        //input search element
        System.out.print("Enter search element: ");
        int key=sc.nextInt();
        int result=linearSearch(arr,key);
        if(result !=-1) {
            System.out.println("Element found at " + result + " index.");
        }else{
            System.out.println("Element not found.");
        }
        sc.close();
    }
}
