package session1.advance;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileNotFoundException;
import java.io.IOException;

//simple file I/O operation to read data from a text file.
public class FileOperation {
    public static void main(String[] args) {
        String filePath = "Java_training/session1/advance/test.txt";
        try (BufferedReader br = new BufferedReader(new FileReader(filePath))) {
            String line;
            System.out.println("Reading file content:\n");
            while ((line = br.readLine()) != null) {
                System.out.println(line);
            }
        }
        catch (FileNotFoundException e) {
            System.out.println("Error: File not found! Please check the file path.");
        }
        catch (IOException e) {
            System.out.println("Error: Problem occurred while reading the file.");

        }
        finally {
            System.out.println("File operation completed.");
        }
    }
}