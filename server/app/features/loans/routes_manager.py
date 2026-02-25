from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm

from app.features.users.models import User
from app.features.users.schema import UserCreate,UserRead
from app.features.loans.models import UserLoanApplication,BankLoan
from app.features.loans.schema import BankLoanCreate,BankLoanRead, UserLoanApplicationResponse,UserLoanApplicationUpdate
from app.core.security import get_current_user,RequireRole
from dependencies import get_db
from app.features.notifications.models import Notification
from app.features.notifications.tasks import notify_user_of_update

router = APIRouter(prefix="/manager/loans",dependencies=[Depends(RequireRole.manager)], tags=["Manager Loans"])

# Manager routes for managing loans (CRUD operations for loans, viewing all applications, updating application status, etc.)
@router.get("/",response_model=list[BankLoanRead],status_code=status.HTTP_200_OK)
async def get_all_loans(db: AsyncSession = Depends(get_db)):
    stmt = select(BankLoan)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/",response_model=BankLoanRead,status_code=status.HTTP_201_CREATED)
async def create_loan(loan_data: BankLoanCreate, db: AsyncSession = Depends(get_db)):
    loan = BankLoan(name=loan_data.name, interest_rate=loan_data.interest_rate, is_active=True)
    db.add(loan)
    await db.commit()
    await db.refresh(loan)
    return loan

@router.put("/{loan_id}",response_model=BankLoanRead,status_code=status.HTTP_200_OK)
async def update_loan(loan_id: int, loan_data: BankLoanCreate, db: AsyncSession = Depends(get_db)):
    stmt = select(BankLoan).where(BankLoan.id == loan_id)
    result = await db.execute(stmt)
    loan = result.scalar_one_or_none()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    loan.name = loan_data.name
    loan.interest_rate = loan_data.interest_rate
    await db.commit()
    await db.refresh(loan)
    return loan

@router.delete("/{loan_id}",status_code=status.HTTP_204_NO_CONTENT)
async def delete_loan(loan_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(BankLoan).where(BankLoan.id == loan_id)
    result = await db.execute(stmt)
    loan = result.scalar_one_or_none()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    await db.delete(loan)
    await db.commit()

@router.get("/applications",response_model=list[UserLoanApplicationResponse],status_code=status.HTTP_200_OK)
async def get_all_loan_applications(status: str = None, db: AsyncSession = Depends(get_db)):
    stmt = select(UserLoanApplication).options(selectinload(UserLoanApplication.loan))
    if status:
        stmt = stmt.where(UserLoanApplication.status == status)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.put("/applications/{application_id}", response_model=UserLoanApplicationResponse, status_code=status.HTTP_200_OK)
async def update_loan_application_status(
    application_id: int, 
    application_data: UserLoanApplicationUpdate, 
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(UserLoanApplication).options(selectinload(UserLoanApplication.loan)).where(UserLoanApplication.id == application_id)
    application = (await db.execute(stmt)).scalar_one_or_none()
    
    if not application:
        raise HTTPException(status_code=404, detail="Loan application not found")
        
    application.status = application_data.status

    notification_stmt = update(Notification).where(
        Notification.reference_id == f"loan_app_{application_id}" 
    ).values(is_read=True)
    await db.execute(notification_stmt)

    await db.commit()
    await db.refresh(application)

    background_tasks.add_task(
        notify_user_of_update, 
        user_id=application.userId, 
        status=application_data.status
    )

    return application
