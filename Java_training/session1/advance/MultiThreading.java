package session1.advance;

//multi-threading example
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

// Task representing an order
class OrderTask implements Runnable {
    private int orderId;

    public OrderTask(int orderId) {
        this.orderId = orderId;
    }

    @Override
    public void run() {
        System.out.println(Thread.currentThread().getName() +
                " processing Order #" + orderId);
        try {
            Thread.sleep(1000); // simulate processing time
        } catch (InterruptedException e) {
            System.out.println("Error processing order " + orderId);
        }

        System.out.println(Thread.currentThread().getName() +
                " completed Order #" + orderId);
    }
}

public class MultiThreading{

    public static void main(String[] args) {
        // Create a pool with 2 threads
        ExecutorService executor = Executors.newFixedThreadPool(2);

        // Submit 4 tasks
        for (int i = 1; i <= 4; i++) {
            executor.execute(new OrderTask(i));
        }

        // Shutdown pool
        executor.shutdown();
        System.out.println("All tasks submitted...");
    }
}