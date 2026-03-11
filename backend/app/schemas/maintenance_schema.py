from pydantic import BaseModel # type: ignore

class MaintenanceResponse(BaseModel):
    severity: str
    message: str