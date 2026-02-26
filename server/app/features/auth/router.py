from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Annotated, Optional
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
import json

from app.features.users.models import User
from app.features.users.schema import UserCreate,UserRead
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.encryption import encryption_manager
from dependencies import get_db

# Schema for encrypted requests
class EncryptedRequest(BaseModel):
    encrypted_payload: str
    encrypted_key: str

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register_user(user_in:UserCreate , db:AsyncSession= Depends(get_db)):
    stmt = select(User).where(User.email == user_in.email)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        email=user_in.email,
        name=user_in.name,
        password=get_password_hash(user_in.password),
        role=user_in.role
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login")
async def login_user(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], 
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.email == form_data.username)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    print(user)

    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Create and return JWT Token
    access_token = create_access_token(data={"sub": user.email})

    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/public-key")
async def get_public_key():
    """Endpoint to fetch the server's RSA public key for client-side encryption"""
    return {
        "public_key": encryption_manager.get_public_key_pem()
    }

@router.post("/login-encrypted")
async def login_user_encrypted(
    encrypted_req: EncryptedRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Encrypted login endpoint.
    Expects encrypted JSON with 'username' and 'password' fields.
    """
    print(f"[DEBUG] Login-encrypted request received")
    print(f"[DEBUG] Encrypted key present: {bool(encrypted_req.encrypted_key)}")
    print(f"[DEBUG] Encrypted payload present: {bool(encrypted_req.encrypted_payload)}")
    
    try:
        # Decrypt the AES key
        print(f"[DEBUG] Decrypting AES key...")
        aes_key = encryption_manager.decrypt_aes_key(encrypted_req.encrypted_key)
        print(f"[DEBUG] AES key decrypted successfully")
        
        # Decrypt the payload
        print(f"[DEBUG] Decrypting payload...")
        decrypted_data = encryption_manager.decrypt_payload(encrypted_req.encrypted_payload, aes_key)
        print(f"[DEBUG] Payload decrypted: {list(decrypted_data.keys())}")
        
        # Extract email and password from decrypted data
        email = decrypted_data.get("username") or decrypted_data.get("email")
        password = decrypted_data.get("password")
        
        print(f"[DEBUG] Email: {email}, Password present: {bool(password)}")
        
        if not email or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing email/username or password"
            )
        
        # Query user
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user or not verify_password(password, user.password):
            print(f"[DEBUG] Auth failed: user={user is not None}, password_match={user and verify_password(password, user.password)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        print(f"[DEBUG] Authentication successful for user: {user.email}")
        
        # Create and return JWT Token
        access_token = create_access_token(data={"sub": user.email})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "email": user.email,
            "id": user.id,
            "name": user.name,
            "role": user.role
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Login-encrypted error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Decryption failed: {str(e)}"
        )

@router.post("/register-encrypted", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register_user_encrypted(
    encrypted_req: EncryptedRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Encrypted register endpoint.
    Expects encrypted JSON with 'email', 'name', 'password', and 'role' fields.
    """
    try:
        # Decrypt the AES key
        aes_key = encryption_manager.decrypt_aes_key(encrypted_req.encrypted_key)
        
        # Decrypt the payload
        decrypted_data = encryption_manager.decrypt_payload(encrypted_req.encrypted_payload, aes_key)
        
        # Extract data from decrypted payload
        email = decrypted_data.get("email")
        name = decrypted_data.get("name")
        password = decrypted_data.get("password")
        role = decrypted_data.get("role", "user")
        
        if not all([email, name, password]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing required fields: email, name, password"
            )
        
        # Check if email already exists
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user
        new_user = User(
            email=email,
            name=name,
            password=get_password_hash(password),
            role=role
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        
        return new_user
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Decryption failed: {str(e)}"
        )