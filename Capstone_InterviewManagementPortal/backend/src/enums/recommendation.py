from enum import Enum

class Recommendation(str, Enum):

    SELECT = "SELECT"
    REJECT = "REJECT"
    HOLD = "HOLD"