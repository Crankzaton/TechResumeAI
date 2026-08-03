"""Resume enhancement helpers (stub implementation for local development)."""


def enhance_bullet(text: str) -> str:
    """Return a polished resume bullet from raw input (no external API)."""
    cleaned = " ".join(text.strip().split())
    if not cleaned:
        return ""
    if cleaned.endswith("."):
        return cleaned
    return f"{cleaned}."

