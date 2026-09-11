# Kisan Setu

## Smart Agricultural Procurement & Logistics Platform

> **One app. One queue. Zero surprises at the gate.**

Kisan Setu is a smart, automation-first agricultural procurement platform designed to make the physical mandi experience more **predictable, transparent, fair, and accessible** for farmers.

The platform addresses the problems of long waiting times, lack of procurement-schedule information, weather-blind travel, limited digital access, uncertain grading and pricing, and lack of visibility into payment status.

**Problem Statement:** SIH26032  
**Theme:** Smart Automation  
**Category:** Software  
**Team:** NEXOFORGE  
**Event:** Smart India Hackathon / Tekathon 5.0 – 2026  
**Ministry:** Ministry of Consumer Affairs, Food & Public Distribution

---

## Table of Contents

- [Problem](#problem)
- [Our Solution](#our-solution)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Farmer Journey](#farmer-journey)
- [User Roles](#user-roles)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Smart Automation](#smart-automation)
- [Offline-First Approach](#offline-first-approach)
- [Transparency & Anti-Corruption](#transparency--anti-corruption)
- [Accessibility](#accessibility)
- [Privacy & Security](#privacy--security)
- [Core Build](#core-build)
- [Future Scope](#future-scope)
- [Feasibility & Rollout](#feasibility--rollout)
- [Expected Impact](#expected-impact)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Research & References](#research--references)
- [Team](#team)

---

# Problem

Agricultural procurement centres experience a major influx of farmers during harvest seasons. Farmers often travel long distances without knowing:

- Whether the procurement centre is already crowded
- How many farmers are ahead of them
- When their turn is likely to arrive
- Whether bad weather may affect their journey
- What grade their produce will receive
- How the final price was calculated
- When their payment will be credited

This creates several challenges:

### Long & Unpredictable Waiting Times

Farmers have limited visibility into daily procurement capacity and queue conditions. As a result, many arrive early and wait for several hours or even longer during peak periods.

### Weather-Blind Travel

Farmers may transport exposed crops over long distances. Unexpected rain or extreme heat during travel or while waiting at the centre can reduce crop quality and value.

### Overloaded Procurement Centres

Without advance visibility into expected footfall, some centres become overloaded while others remain underutilized.

### Digital Divide

Many farmers may not have smartphones, reliable internet connectivity, or sufficient comfort with English-only applications.

### Lack of Procurement Transparency

Farmers may not have clear visibility into:

- Weighing
- Grading
- Price adjustments
- Billing
- Payment processing
- Payment credit status

---

# Our Solution

Kisan Setu digitizes the **physical, day-to-day procurement experience** rather than attempting to replace existing agricultural trading platforms.

Farmers can:

1. Book a procurement slot
2. View crowd and capacity information
3. Check weather and price history
4. Receive a travel alert based on queue conditions
5. Check in using an offline-capable QR pass
6. Track weighing and grading
7. View pricing and transaction details
8. Raise a grievance with supporting evidence
9. Track payment until it is credited

Kisan Setu is designed to **complement existing systems such as e-NAM**, focusing specifically on the physical procurement-centre experience.

---

# Key Features

## 1. Smart Slot Booking

The farmer receives a colour-coded procurement calendar:

| Status | Meaning |
|---|---|
| 🟢 Green | Capacity available |
| 🟡 Amber | Capacity filling up |
| 🔴 Red | Fully booked |

The system maintains the daily procurement capacity and locks capacity when a farmer successfully books a slot.

This naturally distributes farmer arrivals across available days.

---

## 2. Nearby Procurement Centre Recommendation

When a preferred centre is full, Kisan Setu can identify nearby open procurement centres.

The **Haversine formula** is used to calculate approximate geographical distance between the farmer and available centres.

```text
Farmer Location
       ↓
Check Centre Availability
       ↓
Calculate Distance
       ↓
Find Nearest Available Centre
       ↓
Recommend Alternative
