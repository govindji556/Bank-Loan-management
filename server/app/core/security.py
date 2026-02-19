from datetime import datetime, timedelta, timezone
from typing import Annotated, List
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# 1. Import the modern pwdlib instead of passlib
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher

# from app.core.config import settings
from dependencies import get_db
from app.features.users.models import User, UserRole

from pydantic_settings import BaseSettings

# 2. Setup the new PasswordHash context
pwd_context = PasswordHash((BcryptHasher(),))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class Settings(BaseSettings):
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    SECRET_KEY: str = "daslklkajldkjasfkdslkfkj"
    ALGORITHM: str = "HS256"

# Create an instance of the class
settings = Settings()

settings.ACCESS_TOKEN_EXPIRE_MINUTES
# 3. The functions stay exactly the same!
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# 3. The "Lock" Dependency
async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], 
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    This dependency reads the JWT from the request header, decodes it, 
    finds the user in the database, and returns the User object.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.InvalidTokenError:
        raise credentials_exception
    
    # Fetch user from database
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
        
    return user

class RoleChecker:
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)):
        """
        This function runs whenever a route uses this dependency.
        It checks if the logged-in user has one of the allowed roles.
        """
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Operation not permitted"
            )
        return user
    
class RequireRole:
    """
    A centralized registry for all role-based dependencies.
    This makes it easy to autocomplete and manage permission combinations.
    """
    # 1. Strict Roles
    manager = RoleChecker([UserRole.MANAGER])
    user = RoleChecker([UserRole.USER])
    
    # 2. Combined Roles
    any_authenticated = RoleChecker([UserRole.USER, UserRole.MANAGER])