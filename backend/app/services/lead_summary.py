def generate_lead_summary(lead):
    summary_parts = []

    summary_parts.append(
        f"{lead.name} is a lead from {lead.company}"
    )

    if lead.event:
        summary_parts.append(
            f"associated with the {lead.event} event"
        )

    if lead.notes:
        summary_parts.append(
            f"The lead provided the following information: {lead.notes}"
        )

    if lead.follow_up_status == "PENDING":
        summary_parts.append(
            "The lead is currently waiting for initial follow-up"
        )

    elif lead.follow_up_status == "CONTACTED":
        summary_parts.append(
            "The lead has already been contacted"
        )

    elif lead.follow_up_status == "FOLLOW_UP":
        summary_parts.append(
            "The lead requires a follow-up"
        )

    elif lead.follow_up_status == "CONVERTED":
        summary_parts.append(
            "The lead has successfully converted"
        )

    elif lead.follow_up_status == "CLOSED":
        summary_parts.append(
            "The lead has been closed"
        )

    return ". ".join(summary_parts) + "."