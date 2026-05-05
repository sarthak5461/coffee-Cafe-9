"""Backend API tests for Coffee Cafe 9."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://coffee-web-app-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@coffeecafe9.com"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return r.json()["token"]


@pytest.fixture
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ---------- Health / root ----------
class TestHealth:
    def test_root(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200
        assert "Coffee Cafe 9" in r.json().get("message", "")


# ---------- Auth ----------
class TestAuth:
    def test_login_success_returns_token_and_cookie(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        data = r.json()
        assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 20
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        # cookie set
        cookies = r.cookies.get_dict()
        assert "access_token" in cookies

    def test_login_invalid(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me_requires_auth(self, session):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_with_bearer(self, admin_token):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_logout_clears_cookie(self, session):
        s = requests.Session()
        s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        r = s.post(f"{API}/auth/logout")
        assert r.status_code == 200


# ---------- Menu ----------
class TestMenu:
    def test_list_menu(self, session):
        r = session.get(f"{API}/menu")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list) and len(items) > 0
        assert all("id" in i and "name" in i and "category" in i for i in items)

    def test_filter_category(self, session):
        r = session.get(f"{API}/menu", params={"category": "Coffee"})
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        assert all(i["category"] == "Coffee" for i in items)

    def test_filter_popular(self, session):
        r = session.get(f"{API}/menu", params={"popular": "true"})
        assert r.status_code == 200
        items = r.json()
        assert all(i["is_popular"] is True for i in items)

    def test_create_requires_auth(self):
        r = requests.post(f"{API}/menu", json={"name": "TEST_X", "category": "Coffee", "price": 100})
        assert r.status_code == 401

    def test_menu_crud(self, auth_headers):
        # CREATE
        payload = {"name": "TEST_Mocha", "category": "Coffee", "price": 199.5,
                   "description": "test", "image": "", "is_popular": True}
        c = requests.post(f"{API}/menu", json=payload, headers=auth_headers)
        assert c.status_code == 200, c.text
        item = c.json()
        item_id = item["id"]
        assert item["name"] == "TEST_Mocha"

        # GET verify in list
        g = requests.get(f"{API}/menu")
        assert any(x["id"] == item_id for x in g.json())

        # UPDATE
        payload["price"] = 250
        u = requests.put(f"{API}/menu/{item_id}", json=payload, headers=auth_headers)
        assert u.status_code == 200
        assert u.json()["price"] == 250

        # DELETE
        d = requests.delete(f"{API}/menu/{item_id}", headers=auth_headers)
        assert d.status_code == 200

        # verify removed
        g2 = requests.get(f"{API}/menu")
        assert not any(x["id"] == item_id for x in g2.json())


# ---------- Reviews ----------
class TestReviews:
    def test_list_reviews(self, session):
        r = session.get(f"{API}/reviews")
        assert r.status_code == 200
        assert len(r.json()) > 0

    def test_filter_featured(self, session):
        r = session.get(f"{API}/reviews", params={"featured": "true"})
        assert r.status_code == 200
        assert all(x["is_featured"] is True for x in r.json())

    def test_public_submit(self, session):
        r = session.post(f"{API}/reviews", json={"name": "TEST_User", "rating": 4.5, "comment": "Great test"})
        assert r.status_code == 200
        rid = r.json()["id"]
        # cleanup via admin
        s = requests.Session()
        login = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        token = login.json()["token"]
        requests.delete(f"{API}/reviews/{rid}", headers={"Authorization": f"Bearer {token}"})

    def test_review_admin_update_delete(self, auth_headers):
        # create as public
        r = requests.post(f"{API}/reviews", json={"name": "TEST_Adm", "rating": 5, "comment": "x"})
        rid = r.json()["id"]
        # update auth required
        unauth = requests.put(f"{API}/reviews/{rid}", json={"name": "TEST_Adm", "rating": 5, "comment": "y", "is_featured": True})
        assert unauth.status_code == 401
        u = requests.put(f"{API}/reviews/{rid}", json={"name": "TEST_Adm", "rating": 5, "comment": "y", "is_featured": True}, headers=auth_headers)
        assert u.status_code == 200 and u.json()["is_featured"] is True
        d = requests.delete(f"{API}/reviews/{rid}", headers=auth_headers)
        assert d.status_code == 200


# ---------- Homepage ----------
class TestHomepage:
    def test_get_homepage(self, session):
        r = session.get(f"{API}/homepage")
        assert r.status_code == 200
        d = r.json()
        assert d["hero_title"] == "Coffee Cafe 9"
        assert "address" in d and "phone" in d

    def test_update_requires_auth(self):
        r = requests.put(f"{API}/homepage", json={"hero_title": "X"})
        assert r.status_code == 401

    def test_update_homepage(self, auth_headers):
        # get current
        cur = requests.get(f"{API}/homepage").json()
        new_tagline = "Test tagline " + os.urandom(3).hex()
        cur["hero_tagline"] = new_tagline
        r = requests.put(f"{API}/homepage", json=cur, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["hero_tagline"] == new_tagline
        # restore
        cur["hero_tagline"] = "Good ambiance, tasty food, and friendly staff"
        requests.put(f"{API}/homepage", json=cur, headers=auth_headers)


# ---------- Contact ----------
class TestContact:
    def test_public_submit(self, session):
        r = session.post(f"{API}/contact", json={"name": "TEST_C", "email": "test@example.com", "message": "hi"})
        assert r.status_code == 200
        assert r.json()["email"] == "test@example.com"

    def test_list_requires_auth(self):
        r = requests.get(f"{API}/contact")
        assert r.status_code == 401

    def test_list_with_auth(self, auth_headers):
        r = requests.get(f"{API}/contact", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)
