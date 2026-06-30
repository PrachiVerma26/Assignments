"""
Pytest configuration file: Adds the project root directory to the Python path so that
application modules can be imported during test execution.
"""

import sys
from pathlib import Path

# Resolve the backend project root directory
ROOT_DIR = Path(__file__).resolve().parent.parent

# Add project root to Python module search path
sys.path.insert(0, str(ROOT_DIR))