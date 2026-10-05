def calculate_lead_score(lead):
    score = 0
    reasons = []

    if lead.company:
        score += 15
        reasons.append("Company information is available")

    if lead.email:
        score += 15
        reasons.append("Valid contact email is available")

    if lead.event:
        score += 10
        reasons.append("Lead is associated with an event")

    if lead.notes:
        score += 20
        reasons.append("Lead contains additional notes")

    if lead.follow_up_status == "PENDING":
        score += 15
        reasons.append("Lead is waiting for follow-up")

    elif lead.follow_up_status == "CONTACTED":
        score += 20
        reasons.append("Lead has already been contacted")

    elif lead.follow_up_status == "FOLLOW_UP":
        score += 25
        reasons.append("Lead requires follow-up")

    elif lead.follow_up_status == "CONVERTED":
        score += 30
        reasons.append("Lead has converted")

    if score >= 70:
        category = "HIGH"
        recommendation = "Contact this lead as soon as possible"

    elif score >= 40:
        category = "MEDIUM"
        recommendation = "Follow up with this lead soon"

    else:
        category = "LOW"
        recommendation = "Keep this lead under observation"

    return {
        "score": min(score, 100),
        "category": category,
        "reasons": reasons,
        "recommendation": recommendation
    }