def calculate_severity(score):
    if score >= 4:
        return "High"
    elif score >= 2:
        return "Medium"
    return "Low"