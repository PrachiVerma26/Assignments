package session1.stringManipulation;

import java.util.Arrays;
import java.util.Scanner;

public class Anagram {
    // Method to check anagrams
    public static boolean areAnagrams(String str1, String str2) {
        // Converted to lowercase for case-insensitive comparison
        str1 = str1.toLowerCase();
        str2 = str2.toLowerCase();

        // If lengths are different, they cannot be anagrams
        if (str1.length() != str2.length()) {
            return false;
        }

        // Convert strings to character arrays and sort them
        char[] charArray1 = str1.toCharArray();
        char[] charArray2 = str2.toCharArray();
        Arrays.sort(charArray1);
        Arrays.sort(charArray2);

        // Compare sorted character arrays
        return Arrays.equals(charArray1, charArray2);
    }

    // Main method to test the program
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // Input two strings
        System.out.print("Enter first string: ");
        String str1 = sc.nextLine();
        System.out.print("Enter second string: ");
        String str2 = sc.nextLine();

        // Check if they are anagrams
        if (areAnagrams(str1, str2)) {
            System.out.println("The strings are anagrams.");
        } else {
            System.out.println("The strings are NOT anagrams.");
        }

        sc.close();
    }
}