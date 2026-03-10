import aiosqlite
from aiosqlite import IntegrityError
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_db
from app.models.auth import SignupRequest, SigninRequest, TokenResponse
from app.services.auth_service import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest, db: aiosqlite.Connection = Depends(get_db)):
    hashed = hash_password(body.password)
    try:
        async with db.execute(
            "INSERT INTO users (email, password) VALUES (?, ?)", (body.email, hashed)
        ) as cur:
            await db.commit()
            user_id = cur.lastrowid
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Email already registered")

    return TokenResponse(access_token=create_access_token(user_id=user_id, email=body.email))


@router.post("/signin", response_model=TokenResponse)
async def signin(body: SigninRequest, db: aiosqlite.Connection = Depends(get_db)):
    async with db.execute(
        "SELECT id, password FROM users WHERE email = ?", (body.email,)
    ) as cur:
        row = await cur.fetchone()

    if not row or not verify_password(body.password, row["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return TokenResponse(access_token=create_access_token(user_id=row["id"], email=body.email))
