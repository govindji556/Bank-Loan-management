from __future__ import annotations

from pydantic import BaseModel,Field,ConfigDict
from typing import TYPE_CHECKING
import enum

from app.features.loans.enums import LoanStatus

if TYPE_CHECKING:
    from app.features.users.schema import UserRead

class BankLoanBase(BaseModel):
    name: str
    interest_rate: float

    model_config = ConfigDict(from_attributes=True)

class BankLoanCreate(BaseModel):
    name: str = Field(..., description="Name of the loan")
    interest_rate: float = Field(..., description="Interest rate for the loan")

class BankLoanRead(BankLoanBase):
    id: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class UserLoanApplicationBase(BaseModel):
    amount: float = Field(..., description="Amount requested for the loan application")

    model_config = ConfigDict(from_attributes=True)

class UserLoanApplicationCreate(UserLoanApplicationBase):
    loan_id: int

class UserLoanApplicationUpdate(BaseModel):
    status: LoanStatus

class UserLoanApplicationResponse(BaseModel):
    id: int
    amount: float
    status: LoanStatus
    
    loan: BankLoanBase 
    
    model_config = ConfigDict(from_attributes=True)

class managerLoanApplicationResponse(UserLoanApplicationResponse):
    user: "UserRead"