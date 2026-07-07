import logging
import sys
from pathlib import Path

def setup_application_logger():
    """Core application logger setup for Interview Management Portal."""
    
    # Create logs directory
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(logs_dir / "interview_portal.log"),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    return logging.getLogger("interview_management_portal")

# Application-wide logger instance
app_logger = setup_application_logger()
