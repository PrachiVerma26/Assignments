package session1.stringManipulation;

import java.util.Scanner;

// program to count the number of vowels in a string.

public class CountVowels{
    // Method to count vowels in a string
    public static int countVowels(String str) {
        int count = 0;
        str = str.toLowerCase(); // Converted to lowercase for case-insensitive comparison

        // Iterate through each character in the string
        for (int i = 0; i < str.length(); i++) {
            char ch = str.charAt(i);
            if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u') {
                count++; // Increment count if character is a vowel
            }
        }
        return count;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // Input string
        System.out.print("Enter a string: ");
        String inputString = sc.nextLine();

        // display result
        int vowelCount = countVowels(inputString);
        System.out.println("Number of vowels: " + vowelCount);

        sc.close();
    }
}