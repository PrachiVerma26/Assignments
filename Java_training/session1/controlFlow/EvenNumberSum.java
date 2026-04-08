// calculate the sum of even numbers from 1 to 10 using a while loop.

package session1.controlFlow;
public class EvenNumberSum {
    public static void main(String[] args) {
        int num=1;
        int result=0;
        while(num<=10){
            if(num%2==0){
                result+=num;
            }num+=1;
        }
        System.out.println("Sum of even number from 1-10 is " + result);
    }
}
