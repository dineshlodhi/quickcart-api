#!/bin/bash

# ============================================================
# Mini Zepto Backend — API Test Script
# ============================================================
# Usage:
#   1. Start the server:  npm run dev
#   2. In another terminal: chmod +x test-api.sh && ./test-api.sh
#
# Requires: curl, jq (optional, for pretty JSON)
# ============================================================

BASE="http://localhost:3000"
BOLD="\033[1m"
GREEN="\033[32m"
CYAN="\033[36m"
RESET="\033[0m"

# Use jq for pretty printing if available, otherwise cat
if command -v jq &> /dev/null; then
  PRETTY="jq ."
else
  PRETTY="cat"
  echo "(Install jq for pretty-printed JSON: brew install jq)"
  echo ""
fi

print_header() {
  echo ""
  echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo -e "${BOLD}${GREEN}  $1${RESET}"
  echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
}

# ──────────────────────────────────────────────
# 1. Health Check
# ──────────────────────────────────────────────
print_header "GET /health"
curl -s "$BASE/health" | $PRETTY

# ──────────────────────────────────────────────
# 2. Products — List All
# ──────────────────────────────────────────────
print_header "GET /products  (list all)"
curl -s "$BASE/products" | $PRETTY

# ──────────────────────────────────────────────
# 3. Products — Create
# ──────────────────────────────────────────────
print_header "POST /products  (create new product)"
CREATE_RESPONSE=$(curl -s -X POST "$BASE/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mango Alphonso",
    "description": "Premium Ratnagiri Alphonso mangoes, box of 6",
    "category": "fruits",
    "price": 350,
    "stock": 40,
    "imageUrl": "https://images.unsplash.com/photo-1553279768-865429fa0078",
    "isAvailable": true
  }')
echo "$CREATE_RESPONSE" | $PRETTY

# Extract the new product ID for later use
if command -v jq &> /dev/null; then
  NEW_PRODUCT_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.id')
else
  NEW_PRODUCT_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
fi
echo ""
echo "  → Saved product ID: $NEW_PRODUCT_ID"

# ──────────────────────────────────────────────
# 4. Products — Get By ID
# ──────────────────────────────────────────────
print_header "GET /products/:id  (get one product)"
curl -s "$BASE/products/$NEW_PRODUCT_ID" | $PRETTY

# ──────────────────────────────────────────────
# 5. Products — Update (PATCH)
# ──────────────────────────────────────────────
print_header "PATCH /products/:id  (update price & stock)"
curl -s -X PATCH "$BASE/products/$NEW_PRODUCT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 299,
    "stock": 55
  }' | $PRETTY

# ──────────────────────────────────────────────
# 6. Products — Search
# ──────────────────────────────────────────────
print_header "GET /products/search?q=milk  (search)"
curl -s "$BASE/products/search?q=milk" | $PRETTY

# ──────────────────────────────────────────────
# 7. Products — Filter by Category
# ──────────────────────────────────────────────
print_header "GET /products/category/snacks  (filter by category)"
curl -s "$BASE/products/category/snacks" | $PRETTY

# ──────────────────────────────────────────────
# 8. Cart — View (empty)
# ──────────────────────────────────────────────
print_header "GET /cart  (view empty cart)"
curl -s "$BASE/cart" | $PRETTY

# ──────────────────────────────────────────────
# 9. Cart — Add Item
# ──────────────────────────────────────────────
print_header "POST /cart/items  (add product to cart)"
curl -s -X POST "$BASE/cart/items" \
  -H "Content-Type: application/json" \
  -d "{
    \"productId\": \"$NEW_PRODUCT_ID\",
    \"quantity\": 2
  }" | $PRETTY

# Grab a seeded product ID from /products to add a second item
SECOND_PRODUCT_ID=$(curl -s "$BASE/products" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

print_header "POST /cart/items  (add a second item)"
curl -s -X POST "$BASE/cart/items" \
  -H "Content-Type: application/json" \
  -d "{
    \"productId\": \"$SECOND_PRODUCT_ID\",
    \"quantity\": 3
  }" | $PRETTY

# ──────────────────────────────────────────────
# 10. Cart — Update Quantity
# ──────────────────────────────────────────────
print_header "PATCH /cart/items/:productId  (update quantity)"
curl -s -X PATCH "$BASE/cart/items/$NEW_PRODUCT_ID" \
  -H "Content-Type: application/json" \
  -d '{ "quantity": 5 }' | $PRETTY

# ──────────────────────────────────────────────
# 11. Cart — View (with items)
# ──────────────────────────────────────────────
print_header "GET /cart  (view cart with items)"
curl -s "$BASE/cart" | $PRETTY

# ──────────────────────────────────────────────
# 12. Orders — Place Order (checkout)
# ──────────────────────────────────────────────
print_header "POST /orders  (checkout — creates order from cart)"
ORDER_RESPONSE=$(curl -s -X POST "$BASE/orders")
echo "$ORDER_RESPONSE" | $PRETTY

if command -v jq &> /dev/null; then
  ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.data.id')
else
  ORDER_ID=$(echo "$ORDER_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
fi
echo ""
echo "  → Order ID: $ORDER_ID"

# ──────────────────────────────────────────────
# 13. Cart — Verify Empty After Checkout
# ──────────────────────────────────────────────
print_header "GET /cart  (should be empty after checkout)"
curl -s "$BASE/cart" | $PRETTY

# ──────────────────────────────────────────────
# 14. Orders — List All
# ──────────────────────────────────────────────
print_header "GET /orders  (list all orders)"
curl -s "$BASE/orders" | $PRETTY

# ──────────────────────────────────────────────
# 15. Orders — Get By ID
# ──────────────────────────────────────────────
print_header "GET /orders/:id  (get one order)"
curl -s "$BASE/orders/$ORDER_ID" | $PRETTY

# ──────────────────────────────────────────────
# 16. Products — Verify Stock Reduced
# ──────────────────────────────────────────────
print_header "GET /products/:id  (verify stock was reduced after order)"
curl -s "$BASE/products/$NEW_PRODUCT_ID" | $PRETTY

# ──────────────────────────────────────────────
# 17. Error Cases
# ──────────────────────────────────────────────
print_header "GET /products/nonexistent-id  (→ 404 Not Found)"
curl -s "$BASE/products/nonexistent-id" | $PRETTY

print_header "POST /products  (→ 400 Validation: negative price)"
curl -s -X POST "$BASE/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bad Product",
    "description": "This should fail",
    "category": "snacks",
    "price": -10,
    "stock": 5,
    "imageUrl": "https://example.com/img.jpg",
    "isAvailable": true
  }' | $PRETTY

print_header "POST /orders  (→ 400 Validation: empty cart)"
curl -s -X POST "$BASE/orders" | $PRETTY

print_header "GET /nowhere  (→ 404 Route not found)"
curl -s "$BASE/nowhere" | $PRETTY

# ──────────────────────────────────────────────
# 18. Products — Delete
# ──────────────────────────────────────────────
print_header "DELETE /products/:id  (delete product)"
curl -s -o /dev/null -w "  HTTP Status: %{http_code} (expect 204)\n" \
  -X DELETE "$BASE/products/$NEW_PRODUCT_ID"

print_header "GET /products/:id  (verify deleted → 404)"
curl -s "$BASE/products/$NEW_PRODUCT_ID" | $PRETTY

# ──────────────────────────────────────────────
# 19. Cart — Remove Item
# ──────────────────────────────────────────────
# Add an item first, then remove it
curl -s -X POST "$BASE/cart/items" \
  -H "Content-Type: application/json" \
  -d "{\"productId\": \"$SECOND_PRODUCT_ID\", \"quantity\": 1}" > /dev/null

print_header "DELETE /cart/items/:productId  (remove item from cart)"
curl -s -X DELETE "$BASE/cart/items/$SECOND_PRODUCT_ID" | $PRETTY

# ──────────────────────────────────────────────
# Done
# ──────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}✅ All tests complete!${RESET}"
echo ""
