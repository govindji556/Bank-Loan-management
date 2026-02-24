from __future__ import annotations

from pydantic import BaseModel,EmailStr,Field,ConfigDict
from typing import List

class UserBase(BaseModel):
    email:EmailStr = Field(..., description="Email or Username")
    name:str = Field(..., description="Name")

class UserCreate(UserBase):
    password:str = Field(...,  min_length=8,   description="Password")
    role:str = Field("user", description="User role, default is 'user'")
    
class UserRead(UserBase):
    id:int = Field(..., description="User ID")
    role:str = Field(..., description="User role")

    model_config = ConfigDict(from_attributes=True)

class UserProfileResponse(UserRead):
    loan_applications: List[UserLoanApplicationResponse] = []
    
    model_config = ConfigDict(from_attributes=True)