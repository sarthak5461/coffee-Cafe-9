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

    # Iter2: read toggle and delete
    def test_contact_read_toggle_and_delete(self, auth_headers):
        # public submit
        cr = requests.post(f"{API}/contact", json={"name": "TEST_Read", "email": "r@e.com", "message": "msg"})
        assert cr.status_code == 200
        cid = cr.json()["id"]
        assert cr.json()["is_read"] is False

        # toggle read requires auth
        un = requests.patch(f"{API}/contact/{cid}/read")
        assert un.status_code == 401
        # toggle to read
        t1 = requests.patch(f"{API}/contact/{cid}/read", headers=auth_headers)
        assert t1.status_code == 200 and t1.json()["is_read"] is True
        # toggle back to unread
        t2 = requests.patch(f"{API}/contact/{cid}/read", headers=auth_headers)
        assert t2.status_code == 200 and t2.json()["is_read"] is False

        # delete requires auth
        un_d = requests.delete(f"{API}/contact/{cid}")
        assert un_d.status_code == 401
        d = requests.delete(f"{API}/contact/{cid}", headers=auth_headers)
        assert d.status_code == 200
        # 404 on subsequent delete
        d2 = requests.delete(f"{API}/contact/{cid}", headers=auth_headers)
        assert d2.status_code == 404


# ---------- Iter2: Reviews approve/feature & visibility ----------
class TestReviewsApproval:
    def test_public_submit_creates_pending(self, auth_headers):
        r = requests.post(f"{API}/reviews", json={"name": "TEST_Pending", "rating": 4, "comment": "c"})
        assert r.status_code == 200
        body = r.json()
        rid = body["id"]
        assert body["is_approved"] is False
        assert body["is_featured"] is False

        # default GET returns approved only -> pending NOT in list
        lst = requests.get(f"{API}/reviews").json()
        assert not any(x["id"] == rid for x in lst), "pending review must not appear in default /reviews"

        # all=true returns it
        all_lst = requests.get(f"{API}/reviews", params={"all": "true"}).json()
        assert any(x["id"] == rid for x in all_lst)

        # cleanup
        requests.delete(f"{API}/reviews/{rid}", headers=auth_headers)

    def test_approve_toggle_requires_auth_and_flips(self, auth_headers):
        r = requests.post(f"{API}/reviews", json={"name": "TEST_Appr", "rating": 5, "comment": "ok"})
        rid = r.json()["id"]
        # unauth
        u = requests.patch(f"{API}/reviews/{rid}/approve")
        assert u.status_code == 401
        # approve -> True
        t1 = requests.patch(f"{API}/reviews/{rid}/approve", headers=auth_headers)
        assert t1.status_code == 200 and t1.json()["is_approved"] is True
        # now visible in default list
        assert any(x["id"] == rid for x in requests.get(f"{API}/reviews").json())
        # toggle back -> False
        t2 = requests.patch(f"{API}/reviews/{rid}/approve", headers=auth_headers)
        assert t2.json()["is_approved"] is False
        requests.delete(f"{API}/reviews/{rid}", headers=auth_headers)

    def test_feature_toggle(self, auth_headers):
        r = requests.post(f"{API}/reviews", json={"name": "TEST_Feat", "rating": 5, "comment": "ok"})
        rid = r.json()["id"]
        u = requests.patch(f"{API}/reviews/{rid}/feature")
        assert u.status_code == 401
        t1 = requests.patch(f"{API}/reviews/{rid}/feature", headers=auth_headers)
        assert t1.status_code == 200 and t1.json()["is_featured"] is True
        t2 = requests.patch(f"{API}/reviews/{rid}/feature", headers=auth_headers)
        assert t2.json()["is_featured"] is False
        requests.delete(f"{API}/reviews/{rid}", headers=auth_headers)

    def test_approve_404(self, auth_headers):
        r = requests.patch(f"{API}/reviews/nonexistent-id/approve", headers=auth_headers)
        assert r.status_code == 404


# ---------- Iter2: Admin Stats ----------
class TestAdminStats:
    def test_stats_requires_auth(self):
        r = requests.get(f"{API}/admin/stats")
        assert r.status_code == 401

    def test_stats_shape_and_values(self, auth_headers):
        r = requests.get(f"{API}/admin/stats", headers=auth_headers)
        assert r.status_code == 200
        d = r.json()
        for k in ["menu_count", "popular_count", "reviews_count", "pending_reviews",
                  "contacts_count", "unread_contacts", "menu_by_category", "recent_contacts"]:
            assert k in d, f"missing key {k}"
        assert isinstance(d["menu_by_category"], dict)
        assert isinstance(d["recent_contacts"], list)
        assert len(d["recent_contacts"]) <= 5
        # menu_count must equal sum of categories
        assert d["menu_count"] == sum(d["menu_by_category"].values())
        assert d["menu_count"] >= 13  # seeded
        # popular_count <= menu_count
        assert 0 <= d["popular_count"] <= d["menu_count"]
        # pending_reviews <= reviews_count
        assert 0 <= d["pending_reviews"] <= d["reviews_count"]

    def test_stats_pending_increments_after_public_submit(self, auth_headers):
        before = requests.get(f"{API}/admin/stats", headers=auth_headers).json()["pending_reviews"]
        r = requests.post(f"{API}/reviews", json={"name": "TEST_StatPending", "rating": 5, "comment": "c"})
        rid = r.json()["id"]
        after = requests.get(f"{API}/admin/stats", headers=auth_headers).json()["pending_reviews"]
        assert after == before + 1
        requests.delete(f"{API}/reviews/{rid}", headers=auth_headers)

    def test_stats_unread_increments_after_contact(self, auth_headers):
        before = requests.get(f"{API}/admin/stats", headers=auth_headers).json()["unread_contacts"]
        r = requests.post(f"{API}/contact", json={"name": "TEST_StatU", "email": "s@e.com", "message": "x"})
        cid = r.json()["id"]
        after = requests.get(f"{API}/admin/stats", headers=auth_headers).json()["unread_contacts"]
        assert after == before + 1
        # cleanup
        requests.delete(f"{API}/contact/{cid}", headers=auth_headers)
