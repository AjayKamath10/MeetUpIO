**1\. Create a Get-Together**

*   Host creates an event with:
    
    *   Event name
        
    *   Preferred date range (e.g., Sat–Sun)
        
    *   City / area
        
    *   Optional note (“coffee”, “dinner”, “hangout”)
        

**2\. Shareable Invite Link**

*   Auto-generate a single link
    
*   Friends can join without signing up
    
*   Works well for WhatsApp / Instagram / Telegram sharing
    

**3\. The Guest Input Portal**

*   **Availability Heatmap:** A mobile-friendly grid where guests can tap the hours they are free. (Inspired by tools like _When2meet_, but modernized).
    
*   **Location Pinning:** Guests input their starting location (Zip code, City, or "Current Location").
    

**4\. The "Fair Middle" Engine**

*   **Time Overlap Logic:** The system automatically highlights the "Golden Window"—the specific time slot where 100% (or the majority) of the group is free.
    
*   **Geographic Centroid:** The system calculates the geographic midpoint based on all user locations to ensure a fair travel distance for everyone.
    

**5\. Common Time Detection**

*   System calculates:
    
    *   Best overlapping time slot
        
    *   Backup options if no perfect overlap
        
*   Highlight:
    
    *   ✅ Best match
        
    *   ⚠️ Partial match (most people available)
        

**6\. Smart Recommendations**

*   **Venue Suggestions:** Based on the calculated midpoint and the chosen activity (e.g., "Dinner"), list 3–5 top-rated venues using an API (Google Places or Yelp).
    
*   **One-Click Details:** Display price range, star rating, and closing time for the suggested venues.
    

**7\. Location Suggestions (Basic)**

*   Based on:
    
    *   Selected area / city
        
    *   Time of day
        
*   Suggest **categories**, not specific bookings:
    
    *   Cafés
        
    *   Restaurants
        
    *   Parks
        
*   3–5 suggestions max (keep it light)
    

**8\. Final Summary Page**

*   One clean page showing:
    
    *   Final suggested date & time
        
    *   Suggested area / place types
        
    *   Who’s coming
        
*   Host can say: **“Confirm this plan”**
    

**9\. Proposed User Flow (Bengaluru Edition)**

To help you visualize the application logic:

1.  **Host** visits site → Selects "Dinner" + "Friday Night" → Gets a link.
    
2.  **Host** sends link to the WhatsApp Group.
    
3.  **Friend A** clicks link → Taps "7 PM - 9 PM" → Enters **"Whitefield"** → Submits.
    
4.  **Friend B** clicks link → Taps "8 PM - 10 PM" → Enters **"Koramangala"** → Submits.
    
5.  **System** calculates:
    
    *   _Best Time:_ 8 PM - 9 PM (Overlap).
        
    *   _Best Location:_ A specific restaurant in **Indiranagar** (The logical, popular midpoint).
        
6.  **Host** sees the suggestion → Clicks "Confirm" → Everyone gets a calendar invite.
