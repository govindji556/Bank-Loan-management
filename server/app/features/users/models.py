import enum
from typing import List, Optional
from database import Base
from sqlalchemy.orm import Mapped,mapped_column,relationship
from sqlalchemy import String, Enum as SQLAEnum

class UserRole(str, enum.Enum):
    USER = "user"
    MANAGER = "manager"

class User(Base):
    __tablename__="users"

    id:Mapped[int]=mapped_column(primary_key=True,index=True)
    email:Mapped[str]=mapped_column(String(255),unique=True,nullable=False,index=True)
    name:Mapped[str]=mapped_column(String(255),nullable=False)
    password:Mapped[str]=mapped_column(String(50),nullable=False)

    role: Mapped[UserRole] = mapped_column(SQLAEnum(UserRole), default=UserRole.USER)

    loan_applications: Mapped[List["UserLoanApplication"]] = relationship(
        "UserLoanApplication", 
        back_populates="user",
        cascade="all, delete-orphan"
    )