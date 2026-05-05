from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from contextlib import asynccontextmanager

# ---------- Config ----------
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXP_MIN = 60 * 24  # 1 day
JWT_SECRET = os.environ["JWT_SECRET"]
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@coffeecafe9.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]


# ---------- Helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXP_MIN),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------- Models ----------
class LoginIn(BaseModel):
    email: EmailStr
    password: str


class MenuItemIn(BaseModel):
    name: str
    category: str
    price: float
    description: str = ""
    image: str = ""
    is_popular: bool = False


class MenuItemOut(MenuItemIn):
    id: str
    created_at: str


class ReviewIn(BaseModel):
    name: str
    rating: float = Field(ge=1, le=5)
    comment: str
    is_featured: bool = False
    is_approved: bool = True


class ReviewOut(ReviewIn):
    id: str
    created_at: str


class HomepageContent(BaseModel):
    hero_title: str = "Coffee Cafe 9"
    hero_subtitle: str = "कॉफी कैफे नाईन"
    hero_tagline: str = "Good ambiance, tasty food, and friendly staff"
    rating: float = 4.5
    review_count: int = 800
    price_range: str = "₹200–400"
    services: List[str] = ["Dine-in", "Takeaway", "No-contact delivery"]
    about_text: str = (
        "Coffee Cafe 9 is a cozy and welcoming cafe known for its warm ambiance, "
        "delicious food, and friendly staff. It is a perfect place to relax, "
        "meet friends, and enjoy quality coffee and snacks."
    )
    address: str = "143, Khirki Extension, Malviya Nagar, New Delhi, Delhi 110017"
    phone: str = "099116 84545"


class ContactIn(BaseModel):
    name: str
    email: EmailStr
    message: str


class ContactOut(ContactIn):
    id: str
    created_at: str
    is_read: bool = False


# ---------- Seed ----------
async def seed_data():
    # admin
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one(
            {"email": ADMIN_EMAIL},
            {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
        )

    # menu
    if await db.menu.count_documents({}) == 0:
        items = [
            ("Veg Burger", "Burgers", 220, "Crispy patty, fresh lettuce, melted cheese in a toasted bun.",
             "https://images.pexels.com/photos/5554607/pexels-photo-5554607.jpeg", True),
            ("Cheese Burst Burger", "Burgers", 280,
             "Loaded with extra molten cheese and signature house sauce.",
             "https://images.pexels.com/photos/5554607/pexels-photo-5554607.jpeg", False),
            ("White Sauce Pasta", "Pasta", 320,
             "Creamy béchamel pasta with herbs, garlic and parmesan.",
             "https://images.unsplash.com/photo-1748012199657-3f34292cdf70", True),
            ("Red Sauce Pasta", "Pasta", 300,
             "Tangy tomato basil sauce with sautéed vegetables.",
             "https://images.unsplash.com/photo-1748012199657-3f34292cdf70", False),
            ("Garlic Noodles", "Pasta", 260,
             "Wok-tossed noodles with toasted garlic and chili oil.",
             "https://images.unsplash.com/photo-1730043033919-46bd6332f302", True),
            ("Cold Coffee with Ice Cream", "Coffee", 240,
             "Chilled espresso shake topped with a scoop of vanilla ice cream.",
             "https://images.unsplash.com/photo-1759923594639-96bbbdf09514", True),
            ("Café Mocha", "Coffee", 220,
             "Espresso, steamed milk and rich dark chocolate.",
             "https://images.pexels.com/photos/15404792/pexels-photo-15404792.jpeg", True),
            ("Cappuccino", "Coffee", 180,
             "Classic Italian-style espresso with foamed milk.",
             "https://images.pexels.com/photos/15404792/pexels-photo-15404792.jpeg", False),
            ("Hot Chocolate", "Drinks", 200,
             "Velvety hot chocolate with marshmallows on top.",
             "https://images.unsplash.com/photo-1720664282854-6081564f7e88", True),
            ("Peach Iced Tea", "Drinks", 180,
             "Sun-brewed black tea with sweet peach essence.",
             "https://images.unsplash.com/photo-1758981919417-ed7574fd988b", True),
            ("Mint Lemonade", "Drinks", 150,
             "Fresh mint, lime juice and sparkling water.",
             "https://images.unsplash.com/photo-1758981919417-ed7574fd988b", False),
            ("Chocolate Brownie", "Desserts", 220,
             "Warm fudge brownie served with a scoop of vanilla ice cream.",
             "https://images.unsplash.com/photo-1720664282854-6081564f7e88", False),
            ("Tiramisu", "Desserts", 280,
             "Layers of espresso-soaked ladyfingers and mascarpone cream.",
             "https://images.unsplash.com/photo-1720664282854-6081564f7e88", False),
        ]
        docs = []
        now = datetime.now(timezone.utc).isoformat()
        for n, c, p, d, img, pop in items:
            docs.append({
                "id": str(uuid.uuid4()),
                "name": n, "category": c, "price": p,
                "description": d, "image": img,
                "is_popular": pop, "created_at": now,
            })
        await db.menu.insert_many(docs)

    # reviews
    if await db.reviews.count_documents({}) == 0:
        sample = [
            ("Aarav Sharma", 5, "Good ambiance, tasty food, and friendly staff 👍", True),
            ("Priya Mehta", 4.5, "Nice place to have coffee and burgers with friends.", True),
            ("Rohan Kapoor", 5, "Very cozy environment and great taste.", True),
            ("Neha Verma", 4, "Loved the cold coffee with ice cream. Will return!", False),
            ("Karan Patel", 4.5, "Cafe Mocha is to die for. Service was quick.", False),
            ("Ishita Reddy", 5, "Perfect spot for an evening hangout. Pasta was creamy and rich.", False),
        ]
        docs = []
        now = datetime.now(timezone.utc).isoformat()
        for n, r, c, f in sample:
            docs.append({
                "id": str(uuid.uuid4()),
                "name": n, "rating": r, "comment": c,
                "is_featured": f, "is_approved": True,
                "created_at": now,
            })
        await db.reviews.insert_many(docs)

    # homepage singleton
    if not await db.homepage.find_one({"_id": "main"}):
        doc = HomepageContent().model_dump()
        doc["_id"] = "main"
        await db.homepage.insert_one(doc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.users.create_index("email", unique=True)
    await db.menu.create_index("category")
    await seed_data()
    yield
    client.close()


app = FastAPI(lifespan=lifespan)
api = APIRouter(prefix="/api")


# ---------- Auth ----------
@api.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=False,
        samesite="lax", max_age=ACCESS_TOKEN_EXP_MIN * 60, path="/",
    )
    return {
        "token": token,
        "user": {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]},
    }


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_admin)):
    return user


# ---------- Homepage ----------
@api.get("/homepage")
async def get_homepage():
    doc = await db.homepage.find_one({"_id": "main"}, {"_id": 0})
    return doc or HomepageContent().model_dump()


@api.put("/homepage")
async def update_homepage(payload: HomepageContent, user: dict = Depends(get_current_admin)):
    data = payload.model_dump()
    await db.homepage.update_one({"_id": "main"}, {"$set": data}, upsert=True)
    return data


# ---------- Menu ----------
@api.get("/menu", response_model=List[MenuItemOut])
async def list_menu(category: Optional[str] = None, popular: Optional[bool] = None):
    q = {}
    if category and category.lower() != "all":
        q["category"] = category
    if popular is not None:
        q["is_popular"] = popular
    items = await db.menu.find(q, {"_id": 0}).sort("created_at", 1).to_list(500)
    return items


@api.post("/menu", response_model=MenuItemOut)
async def create_menu(payload: MenuItemIn, user: dict = Depends(get_current_admin)):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.menu.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.put("/menu/{item_id}", response_model=MenuItemOut)
async def update_menu(item_id: str, payload: MenuItemIn, user: dict = Depends(get_current_admin)):
    res = await db.menu.find_one_and_update(
        {"id": item_id}, {"$set": payload.model_dump()},
        return_document=True, projection={"_id": 0},
    )
    if not res:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return res


@api.delete("/menu/{item_id}")
async def delete_menu(item_id: str, user: dict = Depends(get_current_admin)):
    res = await db.menu.delete_one({"id": item_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"ok": True}


# ---------- Reviews ----------
@api.get("/reviews", response_model=List[ReviewOut])
async def list_reviews(featured: Optional[bool] = None, approved: Optional[bool] = True, all: bool = False):
    """Public list returns approved reviews only by default. Pass `all=true` (admin) to include unapproved."""
    q = {}
    if featured is not None:
        q["is_featured"] = featured
    if not all and approved is not None:
        q["is_approved"] = approved
    items = await db.reviews.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    # Backfill default for legacy docs
    for it in items:
        it.setdefault("is_approved", True)
    return items


@api.post("/reviews", response_model=ReviewOut)
async def create_review(payload: ReviewIn):
    """Public submission allowed; admin can approve & feature."""
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    # Public submissions start unapproved unless caller is admin (we don't check; default to pending)
    doc["is_approved"] = False
    doc["is_featured"] = False
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.reviews.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.put("/reviews/{rid}", response_model=ReviewOut)
async def update_review(rid: str, payload: ReviewIn, user: dict = Depends(get_current_admin)):
    res = await db.reviews.find_one_and_update(
        {"id": rid}, {"$set": payload.model_dump()},
        return_document=True, projection={"_id": 0},
    )
    if not res:
        raise HTTPException(status_code=404, detail="Review not found")
    return res


@api.patch("/reviews/{rid}/approve", response_model=ReviewOut)
async def toggle_approve_review(rid: str, user: dict = Depends(get_current_admin)):
    cur = await db.reviews.find_one({"id": rid})
    if not cur:
        raise HTTPException(status_code=404, detail="Review not found")
    new_val = not cur.get("is_approved", True)
    res = await db.reviews.find_one_and_update(
        {"id": rid}, {"$set": {"is_approved": new_val}},
        return_document=True, projection={"_id": 0},
    )
    return res


@api.patch("/reviews/{rid}/feature", response_model=ReviewOut)
async def toggle_feature_review(rid: str, user: dict = Depends(get_current_admin)):
    cur = await db.reviews.find_one({"id": rid})
    if not cur:
        raise HTTPException(status_code=404, detail="Review not found")
    new_val = not cur.get("is_featured", False)
    res = await db.reviews.find_one_and_update(
        {"id": rid}, {"$set": {"is_featured": new_val}},
        return_document=True, projection={"_id": 0},
    )
    return res


@api.delete("/reviews/{rid}")
async def delete_review(rid: str, user: dict = Depends(get_current_admin)):
    res = await db.reviews.delete_one({"id": rid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"ok": True}


# ---------- Contact ----------
@api.post("/contact", response_model=ContactOut)
async def submit_contact(payload: ContactIn):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["is_read"] = False
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contacts.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.get("/contact", response_model=List[ContactOut])
async def list_contacts(user: dict = Depends(get_current_admin)):
    items = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for it in items:
        it.setdefault("is_read", False)
    return items


@api.patch("/contact/{cid}/read", response_model=ContactOut)
async def toggle_contact_read(cid: str, user: dict = Depends(get_current_admin)):
    cur = await db.contacts.find_one({"id": cid})
    if not cur:
        raise HTTPException(status_code=404, detail="Message not found")
    new_val = not cur.get("is_read", False)
    res = await db.contacts.find_one_and_update(
        {"id": cid}, {"$set": {"is_read": new_val}},
        return_document=True, projection={"_id": 0},
    )
    return res


@api.delete("/contact/{cid}")
async def delete_contact(cid: str, user: dict = Depends(get_current_admin)):
    res = await db.contacts.delete_one({"id": cid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"ok": True}


# ---------- Admin Stats ----------
@api.get("/admin/stats")
async def admin_stats(user: dict = Depends(get_current_admin)):
    menu_count = await db.menu.count_documents({})
    reviews_count = await db.reviews.count_documents({})
    pending_reviews = await db.reviews.count_documents({"is_approved": False})
    contacts_count = await db.contacts.count_documents({})
    unread_contacts = await db.contacts.count_documents({"is_read": False})
    popular_count = await db.menu.count_documents({"is_popular": True})
    recent = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    for it in recent:
        it.setdefault("is_read", False)
    by_category = {}
    async for it in db.menu.find({}, {"_id": 0, "category": 1}):
        c = it.get("category", "Other")
        by_category[c] = by_category.get(c, 0) + 1
    return {
        "menu_count": menu_count,
        "popular_count": popular_count,
        "reviews_count": reviews_count,
        "pending_reviews": pending_reviews,
        "contacts_count": contacts_count,
        "unread_contacts": unread_contacts,
        "menu_by_category": by_category,
        "recent_contacts": recent,
    }


@api.get("/")
async def root():
    return {"message": "Coffee Cafe 9 API", "version": "1.0"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)
