Since our Flutter app already has RevenueCat subscriptions, the backend should **not rely on the Flutter app to tell our server whether a user is subscribed**. The clean architecture is:

**Flutter → RevenueCat → RevenueCat Webhook → Your Backend → MongoDB → Dashboard**

RevenueCat specifically recommends webhooks for keeping your own database synchronized with subscription lifecycle changes. ([RevenueCat](https://www.revenuecat.com/docs/integrations/webhooks?utm_source=chatgpt.com))

## **What you need to add to the backend**

### **1\. Add subscription fields to your User model**

For example:

subscription: {  
  status: {  
    type: String,  
    enum: \[  
      "active",  
      "trialing",  
      "grace\_period",  
      "billing\_issue",  
      "expired",  
      "cancelled",  
      "none"  
    \],  
    default: "none"  
  },  
  entitlement: String,  
  productId: String,  
  store: String,  
  expiresAt: Date,  
  willRenew: Boolean,  
  revenueCatAppUserId: String,  
  lastUpdatedAt: Date  
}

You don't necessarily need every field, but I recommend storing at least:

subscriptionStatus  
subscriptionProductId  
subscriptionExpiresAt  
subscriptionWillRenew  
revenueCatAppUserId  
subscriptionUpdatedAt

Then your dashboard's **User Management** API can simply return:

{  
  "name": "John",  
  "email": "john@example.com",  
  "subscription": {  
    "status": "active",  
    "productId": "premium\_monthly",  
    "expiresAt": "2026-09-24T00:00:00Z",  
    "willRenew": true  
  }  
}  
---

# **2\. Add a RevenueCat webhook endpoint**

Something like:

POST /api/webhooks/revenuecat

RevenueCat will send your backend events when things happen such as:

* subscription started  
* renewal  
* cancellation  
* expiration  
* billing problem  
* trial started  
* refund  
* product change

RevenueCat's webhook payload includes the `app_user_id`, event type, product information, entitlement information, etc. ([RevenueCat](https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields?utm_source=chatgpt.com))

Your backend receives the event and updates MongoDB.

For example:

RevenueCat  
    ↓  
POST /api/webhooks/revenuecat  
    ↓  
find user by revenueCatAppUserId  
    ↓  
update subscription fields  
    ↓  
MongoDB  
---

# **3\. You need a RevenueCat webhook secret**

This is one of the new credentials/configurations you'll need.

In RevenueCat:

**Project → Integrations → Webhooks → Add new configuration**

RevenueCat allows you to configure an authorization header for webhook requests. Your backend verifies that header before accepting the event. ([RevenueCat](https://www.revenuecat.com/docs/integrations/webhooks?utm_source=chatgpt.com))

For example, create your own secret:

REVENUECAT\_WEBHOOK\_SECRET=some-long-random-secret

Configure RevenueCat to send:

Authorization: Bearer some-long-random-secret

Then your backend checks it.

### **Even better: enable HMAC**

RevenueCat also supports HMAC webhook signing using:

X-RevenueCat-Webhook-Signature

This is stronger than a simple shared authorization header. RevenueCat recommends signature verification when enabled. ([RevenueCat](https://www.revenuecat.com/docs/integrations/webhooks?utm_source=chatgpt.com))

If you use HMAC, you'll have another backend environment variable:

REVENUECAT\_WEBHOOK\_SIGNING\_SECRET=...

**This secret must stay server-side.**

---

# **4\. You may need a RevenueCat Secret API key**

This depends on how robust you want the implementation to be.

I recommend having one.

Your backend can use RevenueCat's REST API to retrieve the authoritative subscription/customer information after receiving a webhook. RevenueCat actually recommends this approach because different webhook events contain different information. ([RevenueCat](https://www.revenuecat.com/docs/integrations/webhooks?utm_source=chatgpt.com))

You would create a **RevenueCat API v2 Secret API key**.

RevenueCat currently distinguishes public SDK keys from secret server-side keys. Secret keys begin with `sk_` and must never be put in Flutter or frontend code. ([RevenueCat](https://www.revenuecat.com/docs/projects/authentication?utm_source=chatgpt.com))

Your backend `.env` could therefore have:

REVENUECAT\_SECRET\_API\_KEY=sk\_...  
REVENUECAT\_WEBHOOK\_SECRET=...

Or, if using HMAC:

REVENUECAT\_SECRET\_API\_KEY=sk\_...  
REVENUECAT\_WEBHOOK\_SIGNING\_SECRET=...  
---

# **5\. Make sure Flutter and your backend use the same user ID**

This is **very important**.

RevenueCat has an `app_user_id`. Your existing application has its own user ID.

Ideally:

Your MongoDB user ID  
        ↓  
RevenueCat app\_user\_id

For example:

MongoDB:  
\_id \= 64f8abc123

RevenueCat:  
app\_user\_id \= 64f8abc123

Then when RevenueCat sends:

{  
  "event": {  
    "app\_user\_id": "64f8abc123"  
  }  
}

your backend immediately knows which MongoDB user to update.

If you're currently allowing RevenueCat to generate anonymous IDs, **I would change this before implementing the dashboard synchronization**.

---

# **6\. Your Flutter app should identify the RevenueCat customer**

When the user logs into your Flutter app, RevenueCat should be configured/logged in with your application's user ID.

Conceptually:

await Purchases.logIn(yourBackendUserId);

Then RevenueCat knows:

User A  
   ↓  
RevenueCat app\_user\_id \= User A's backend ID

This is what allows the webhook to map the purchase back to your MongoDB user.

---

# **7\. Update the User Management API**

Currently you probably have something like:

GET /api/admin/users

or:

GET /api/users

Add the subscription fields to the response.

For example:

{  
  "\_id": "123",  
  "name": "John",  
  "email": "john@example.com",  
  "subscriptionStatus": "active",  
  "subscriptionProductId": "premium\_monthly",  
  "subscriptionExpiresAt": "2026-09-24T00:00:00Z",  
  "subscriptionWillRenew": true  
}

Then the dashboard can display:

| User | Email | Subscription |
| ----- | ----- | ----- |
| John | john@example.com | 🟢 Active |
| Sarah | sarah@example.com | 🟡 Trial |
| Mike | mike@example.com | 🔴 Expired |
| David | david@example.com | ⚪ None |

---

# **8\. Don't make the dashboard call RevenueCat directly**

I would **not** do:

Dashboard  
   ↓  
RevenueCat API

Instead:

Dashboard  
   ↓  
Your Backend  
   ↓  
MongoDB

Your backend owns the application's subscription state.

RevenueCat is the source of truth for the subscription, while MongoDB is your application's synchronized representation of that state.

This also means your dashboard doesn't need any RevenueCat credentials.

---

# **Credentials/configuration you'll need**

### **Flutter**

You should already have:

RevenueCat PUBLIC SDK KEY

RevenueCat says the Flutter SDK should use the platform-specific **public** API keys. ([RevenueCat](https://www.revenuecat.com/docs/getting-started/configuring-sdk?utm_source=chatgpt.com))

### **Backend**

RC\_WEBHOOK\_URL=https://backend.getgocal.com/api/subscription/webhook  
RC\_BEARER=gocal\_rc\_webhook\_sec\_89dfh2  
RC\_GOCALAI\_API\_KEY=sk\_qzayPXNBhGuPOwxeotiRVcNxqtHmQ

Add these to our .env file

**Dashboard**

**No RevenueCat credential needed.**

It talks to your existing backend.

---

## **Recommended final architecture**

                  ┌──────────────────┐  
                   │   Flutter App    │  
                   │                  │  
                   │ RevenueCat SDK   │  
                   └────────┬─────────┘  
                            │  
                            │ purchase  
                            ▼  
                   ┌──────────────────┐  
                   │   RevenueCat     │  
                   │                  │  
                   │ Subscription     │  
                   │ State             │  
                   └────────┬─────────┘  
                            │  
                            │ Webhook  
                            ▼  
              ┌──────────────────────────┐  
              │       Your Backend       │  
              │                          │  
              │ POST /webhooks/revenuecat│  
              │                          │  
              │ Verify webhook           │  
              │ Get customer status      │  
              │ Update MongoDB            │  
              └────────────┬─────────────┘  
                           │  
                           ▼  
                    ┌─────────────┐  
                    │  MongoDB    │  
                    │             │  
                    │ User        │  
                    │ Subscription│  
                    │ Status      │  
                    └──────┬──────┘  
                           │  
                           ▼  
                    ┌─────────────┐  
                    │  Dashboard  │  
                    │             │  
                    │ User Mgmt   │  
                    │             │  
                    │ 🟢 Active   │  
                    │ 🔴 Expired  │  
                    │ ⚪ None     │  
                    └─────────────┘

### **One important point**

You **do not need Google Play or Apple subscription credentials in your backend just to implement this**. RevenueCat abstracts that subscription verification for you. Your backend can use RevenueCat's webhook \+ REST API instead. RevenueCat explicitly positions the REST API as useful when your own backend needs to check subscription status. ([RevenueCat](https://www.revenuecat.com/docs/api-v2?utm_source=chatgpt.com))

So, for your existing architecture, the main backend work is:

1. **Add subscription fields to MongoDB User**  
2. **Ensure RevenueCat `app_user_id` maps to your user ID**  
3. **Create `/api/webhooks/revenuecat`**  
4. **Verify RevenueCat webhook authentication/HMAC**  
5. **Process subscription lifecycle events**  
6. **Optionally query RevenueCat REST API after webhook**  
7. **Expose subscription status in your User Management API**  
8. **Update the dashboard table/UI**  
9. **Add the RevenueCat server credentials to your Vercel/backend environment variables**

If you show me your **current backend User model \+ user-management API/controller**, I can tell you **exactly which files/functions need to change and what the MongoDB schema \+ RevenueCat webhook implementation should look like**.

