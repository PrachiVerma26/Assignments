"""
Program 4: Simulate file downloads using multiple threads.
"""

import threading
import time

def download_file(file_name: str) -> None:
    """Simulates downloading a file."""

    print(f"Downloading {file_name}...")

    # Simulate download time
    time.sleep(2)
    
    print(f"{file_name} downloaded successfully.")


if __name__ == "__main__":
    files = [
        "report.pdf",
        "presentation.pptx"
    ]

    threads = []

    for file_name in files:

        # Start a separate thread for each file download
        thread = threading.Thread(target=download_file, args=(file_name,))
        threads.append(thread)
        thread.start()

    # Wait for all download threads to finish
    for thread in threads:
        thread.join()

    print("All downloads completed.")