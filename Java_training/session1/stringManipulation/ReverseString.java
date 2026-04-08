package session1.stringManipulation;
import java.util.Scanner;

// reverse string program
public class ReverseString{
    // Method to reverse a string
    public static String reverseString(String str) {
        String reversed = "";
        for (int i = str.length() - 1; i >= 0; i--) {
            reversed += str.charAt(i); // Append characters in reverse order
        }
        return reversed;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // Input string
        System.out.print("Enter a string: ");
        String inputString = sc.nextLine();

        // Reverse string and displaying result
        String reversed = reverseString(inputString);
        System.out.println("Reversed String: " + reversed);

        sc.close();
    }
}