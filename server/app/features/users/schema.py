from pydantic import BaseModel,Field,ConfigDict

class UserBase(BaseModel):
    email:str = Field(..., description="Email or Username")
    name:str = Field(..., description="Name")

class UserCreate(UserBase):
    password:str = Field(..., description="Password")

class UserRead(UserBase):
    id:int = Field(..., description="User ID")

    model_config = ConfigDict(from_attributes=True)