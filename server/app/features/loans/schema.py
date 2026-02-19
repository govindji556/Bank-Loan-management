from pydantic import BaseModel,Field,ConfigDict

class BankLoanBase(BaseModel):
    id: int
    name: str
    interest_rate: float

    model_config = ConfigDict(from_attributes=True)


