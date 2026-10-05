def generate_follow_up_recommendation(lead):
    if lead.follow_up_status == "CONVERTED":
        return {
            "priority": "LOW",
            "action": "Maintain relationship with the customer",
            "timing": "No immediate follow-up required",
            "channel": "Email",
            "reason": "The lead has already converted"
        }

    if lead.follow_up_status == "CLOSED":
        return {
            "priority": "LOW",
            "action": "Archive the lead",
            "timing": "No follow-up required",
            "channel": "None",
            "reason": "The lead has been closed"
        }

    if lead.follow_up_status == "FOLLOW_UP":
        return {
            "priority": "HIGH",
            "action": "Contact the lead again",
            "timing": "Within 24 hours",
            "channel": "Email or Phone",
            "reason": "The lead is specifically marked for follow-up"
        }

    if lead.follow_up_status == "CONTACTED":
        return {
            "priority": "MEDIUM",
            "action": "Check for a response and follow up if necessary",
            "timing": "Within 2-3 days",
            "channel": "Email",
            "reason": "The lead has already been contacted"
        }

    return {
        "priority": "HIGH",
        "action": "Contact the lead",
        "timing": "Within 24 hours",
        "channel": "Email or Phone",
        "reason": "The lead is pending initial follow-up"
    }