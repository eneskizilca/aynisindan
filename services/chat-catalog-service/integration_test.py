import urllib.request
import json
import time
import base64

def req_json(url, method="GET", data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")
        
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            if res_body:
                return json.loads(res_body)
            return {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        print(f"HTTP Error {e.code} for {method} {url}: {err_body}")
        raise e

def decode_jwt(token):
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return {}
        payload = parts[1]
        # Pad payload base64 if needed
        payload += "=" * ((4 - len(payload) % 4) % 4)
        decoded = base64.b64decode(payload).decode("utf-8")
        return json.loads(decoded)
    except Exception as e:
        print("Failed to decode token:", e)
        return {}

def run_tests():
    print("=== STARTING INTEGRATION TESTS ===")
    
    # Generate unique emails to avoid collision on database re-runs
    ts = int(time.time())
    customer_email = f"customer_{ts}@example.com"
    artisan_email = f"artisan_{ts}@example.com"
    
    # 1. Register Customer
    print(f"\n1. Registering Customer: {customer_email}")
    register_cust = req_json("http://localhost:8080/api/v1/auth/register", "POST", {
        "fullName": "Test Customer",
        "email": customer_email,
        "password": "password123",
        "role": "CUSTOMER"
    })
    customer_id = register_cust["userId"]
    cust_token = register_cust["token"]
    print(f"Customer registered. ID: {customer_id}")
    
    # 2. Register Artisan
    print(f"\n2. Registering Artisan: {artisan_email}")
    register_art = req_json("http://localhost:8080/api/v1/auth/register", "POST", {
        "fullName": "Usta Zanaatkar",
        "email": artisan_email,
        "password": "password123",
        "role": "ARTISAN"
    })
    artisan_id = register_art["userId"]
    art_token = register_art["token"]
    print(f"Artisan registered. ID: {artisan_id}")
    
    # 3. Decode & Verify JWT claims
    print("\n3. Verifying JWT Claims for Artisan...")
    claims = decode_jwt(art_token)
    print("JWT Claims:", json.dumps(claims, indent=2))
    assert claims.get("userId") == artisan_id, "JWT must contain userId claim"
    assert claims.get("role") == "ARTISAN", "JWT must contain role claim"
    print("JWT claims verified successfully!")
    
    # 4. Test Go API: Update Portfolio Profile
    print("\n4. Updating Portfolio Profile on Go Service...")
    update_res = req_json("http://localhost:8081/api/v1/portfolios", "POST", {
        "full_name": "Usta Zanaatkar (Updated)",
        "bio": "Yılların tecrübesi ile ahşap ve metal işleri yapıyorum.",
        "profession": "Marangoz",
        "skills": ["Ahşap Oyma", "Ceviz Masa", "Metal Ayak"]
    }, token=art_token)
    print("Portfolio update response:", update_res)
    
    # 5. Test Go API: Add Manual Portfolio Item
    print("\n5. Adding Manual Portfolio Item...")
    manual_item = req_json("http://localhost:8081/api/v1/portfolios/items", "POST", {
        "title": "Eski El Yapımı Sehpa",
        "description": "Geçen yıl yaptığım ceviz kaplama antik sehpa.",
        "image_url": "https://s3.amazonaws.com/aynisindan/manual-sehpa.jpg",
        "price": 2500.00
    }, token=art_token)
    print("Manual item response:", manual_item)
    manual_item_id = manual_item["id"]
    
    # 6. Test Go API: Get Portfolio
    print("\n6. Fetching Artisan Portfolio from Go...")
    portfolio = req_json(f"http://localhost:8081/api/v1/portfolios/{artisan_id}")
    print("Portfolio details:", json.dumps(portfolio, indent=2))
    assert portfolio["full_name"] == "Usta Zanaatkar (Updated)"
    assert len(portfolio["items"]) == 1
    assert portfolio["items"][0]["title"] == "Eski El Yapımı Sehpa"
    print("Portfolio retrieved and verified successfully!")

    # 7. Create Order as Customer
    print("\n7. Creating Order as Customer...")
    order = req_json("http://localhost:8080/api/v1/orders", "POST", {
        "title": "Ceviz Ağacı Yemek Masası",
        "description": "200x100cm boyutlarında ceviz yemek masası istiyorum.",
        "referenceImageUrl": "https://s3.amazonaws.com/aynisindan/masa-ref.jpg"
    }, token=cust_token)
    order_id = order["id"]
    print(f"Order created. ID: {order_id}")
    
    # 8. Artisan bids a Quote
    print("\n8. Artisan Bidding a Quote...")
    quote = req_json("http://localhost:8080/api/v1/quotes", "POST", {
        "orderId": order_id,
        "offeredPrice": 12000.00,
        "estimatedDays": 10
    }, token=art_token)
    quote_id = quote["id"]
    print(f"Quote submitted. ID: {quote_id}")
    
    # 9. Customer accepts the Quote
    print("\n9. Customer Accepting the Quote...")
    accept_res = req_json(f"http://localhost:8080/api/v1/quotes/{quote_id}/accept", "POST", token=cust_token)
    print("Quote accepted.")
    
    # 10. Artisan completes the Order
    print("\n10. Artisan Completing the Order (Delivering)...")
    complete_res = req_json(f"http://localhost:8080/api/v1/orders/{order_id}/complete", "POST", token=art_token)
    print("Order status updated to DELIVERED.")
    
    # 11. Customer approves delivery (triggers complete notification)
    print("\n11. Customer Approving Delivery (triggers escrow release and Go notification)...")
    approve_res = req_json(f"http://localhost:8080/api/v1/orders/{order_id}/approve", "POST", token=cust_token)
    print("Order status updated to COMPLETED.")
    
    # Wait for async Java notification to Go catalog service
    print("Waiting 1.5 seconds for async notifications...")
    time.sleep(1.5)
    
    # 12. Check Artisan Portfolio on Go service for the completed order
    print("\n12. Fetching Artisan Portfolio to verify sync of completed order...")
    portfolio = req_json(f"http://localhost:8081/api/v1/portfolios/{artisan_id}")
    print("Portfolio after order complete:", json.dumps(portfolio, indent=2))
    
    # We should have 2 items now: the manual one and the automated completed order
    assert len(portfolio["items"]) == 2
    completed_item = next(item for item in portfolio["items"] if item.get("order_id") == order_id)
    assert completed_item["title"] == "Ceviz Ağacı Yemek Masası"
    assert completed_item["price"] == 12000.00
    assert completed_item["is_manual"] is False
    print("Completed order successfully synced to MongoDB portfolio!")
    
    # 13. Customer leaves a Review
    print("\n13. Customer leaving a review on the completed order...")
    review = req_json(f"http://localhost:8080/api/v1/orders/{order_id}/reviews", "POST", {
        "rating": 5,
        "comment": "Masa tek kelimeyle harika oldu, elinize sağlık!"
    }, token=cust_token)
    print("Review created in core backend.")
    
    # Wait for async Java notification to Go catalog service
    print("Waiting 1.5 seconds for async review notification...")
    time.sleep(1.5)
    
    # 14. Check Artisan Portfolio on Go service for review update
    print("\n14. Fetching Artisan Portfolio to verify review sync...")
    portfolio = req_json(f"http://localhost:8081/api/v1/portfolios/{artisan_id}")
    print("Portfolio after review sync:", json.dumps(portfolio, indent=2))
    
    assert portfolio["rating_sum"] == 5
    assert portfolio["rating_count"] == 1
    
    completed_item = next(item for item in portfolio["items"] if item.get("order_id") == order_id)
    assert completed_item["rating"] == 5
    assert completed_item["comment"] == "Masa tek kelimeyle harika oldu, elinize sağlık!"
    print("Review rating and comment successfully synced to MongoDB portfolio!")
    
    # 15. Check Global Catalog Feed
    print("\n15. Fetching Global Catalog Feed...")
    feed = req_json("http://localhost:8081/api/v1/catalog")
    print(f"Feed items count: {len(feed)}")
    print("Feed items details:", json.dumps(feed, indent=2))
    assert len(feed) >= 2
    print("Global catalog feed working perfectly!")
    
    print("\n=== ALL INTEGRATION TESTS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_tests()
