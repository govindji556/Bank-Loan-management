import enum
from datetime import datetime
from typing import List, Optional
from database import Base
from sqlalchemy.orm import Mapped,mapped_column,relationship
from sqlalchemy import String, Float,Boolean, Enum as SQLAEnum, ForeignKey, DateTime
from app.features.loans.enums import LoanStatus

class BankLoan(Base):
    __tablename__= "bank_loans"

    id:Mapped[int]=mapped_column(primary_key=True,index=True)
    name:Mapped[str]=mapped_column(String(255),nullable=False)
    interest_rate:Mapped[float]=mapped_column(Float)
    is_active:Mapped[bool]=mapped_column(Boolean,default=True)
    
    applicant_links: Mapped[List["UserLoanApplication"]] = relationship(
        "UserLoanApplication", 
        back_populates="loan",
        cascade="all, delete-orphan"
    )

class UserLoanApplication(Base):
    __tablename__ = "user_loan_applications"

    id:Mapped[int]=mapped_column(primary_key=True,index=True)
    userId:Mapped[int]=mapped_column(ForeignKey("users.id",ondelete="CASCADE"),primary_key=True)
    loanId:Mapped[int]=mapped_column(ForeignKey("bank_loans.id",ondelete="CASCADE"),primary_key=True)

    amount:Mapped[int]=mapped_column(Float)
    status:Mapped[LoanStatus]=mapped_column(SQLAEnum(LoanStatus),default=LoanStatus.PENDING)

    user: Mapped["User"] = relationship("User", back_populates="loan_applications")
    loan: Mapped["BankLoan"] = relationship("BankLoan", back_populates="applicant_links")