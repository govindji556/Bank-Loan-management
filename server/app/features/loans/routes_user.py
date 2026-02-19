from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm

from app.features.users.models import User
from app.features.users.schema import UserCreate,UserRead
from app.core.security import get_current_user
from dependencies import get_db
from app.features.loans.models import UserLoanApplication,BankLoan
from app.features.loans.schema import BankLoanBase, UserLoanApplicationCreate,UserLoanApplicationResponse

router = APIRouter(prefix="/loans",tags=["Loans"])

@router.get("/",response_model=list[BankLoanBase],status_code=status.HTTP_200_OK)
async def get_user_loans(db: AsyncSession = Depends(get_db)):
    stmt = select(BankLoan).where(BankLoan.is_active == True)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/applications",response_model=list[UserLoanApplicationResponse],status_code=status.HTTP_200_OK)
async def get_user_loan_applications(status: str = None, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(UserLoanApplication).options(selectinload(UserLoanApplication.loan)).where(UserLoanApplication.userId == current_user.id)
    if status:
        stmt = stmt.where(UserLoanApplication.status == status)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/applications/{application_id}",response_model=UserLoanApplicationResponse,status_code=status.HTTP_200_OK)
async def get_user_loan_application(application_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(UserLoanApplication).options(selectinload(UserLoanApplication.loan)).where(UserLoanApplication.id == application_id, UserLoanApplication.userId == current_user.id)
    result = await db.execute(stmt)
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Loan application not found")
    return application

@router.post("/apply/{loan_id}",response_model=UserLoanApplicationResponse,status_code=status.HTTP_201_CREATED)
async def apply_for_loan( application_data: UserLoanApplicationCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    loan_id = application_data.loan_id
    # 1. Check if the loan exists and is active
    stmt = select(BankLoan).where(BankLoan.id == loan_id, BankLoan.is_active == True)
    result = await db.execute(stmt)
    loan = result.scalar_one_or_none()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found or not active")
    
    # 2. Create a new UserLoanApplication
    application = UserLoanApplication(
        userId=current_user.id,
        loanId=loan_id,
        amount=application_data.amount, 
        status="pending"
    )
    # handle duplicate application error if user has already applied for the same loan
    existing_stmt = select(UserLoanApplication).where(UserLoanApplication.userId == current_user.id, UserLoanApplication.loanId == loan_id)
    existing_result = await db.execute(existing_stmt)
    existing_application = existing_result.scalar_one_or_none()
    if existing_application:
        raise HTTPException(status_code=400, detail="You have already applied for this loan")
    db.add(application)
    await db.commit()
    stmt = select(UserLoanApplication).options(selectinload(UserLoanApplication.loan)).where(UserLoanApplication.userId == current_user.id, UserLoanApplication.loanId == loan_id)
    result = await db.execute(stmt)
    full_application = result.scalar_one()
    
    return full_application