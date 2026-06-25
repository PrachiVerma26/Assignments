from pydantic import BaseModel

class SuccessResponse(BaseModel):
    """Generic response schema for successful API operations. """
    
    message: str