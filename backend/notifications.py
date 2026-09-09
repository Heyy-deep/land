import datetime
from typing import Optional
from sqlalchemy.orm import Session
from backend.models import Notification

def send_notification(
    user_id: Optional[str],
    event_type: str,
    title: str,
    message: str,
    db: Optional[Session] = None,
    channel: str = "IN_APP"
) -> dict:
    """
    Standard Notification Dispatcher per SIH 26016 Specification.
    Logs to console and persists to database. Structured so SMS/Email/FCM hooks
    can be plugged in without touching caller code.
    """
    print(f"\n📢 [NLAMS NOTIFICATION - {event_type.upper()}] to {user_id or 'ALL_SUBSCRIBERS'}")
    print(f"   Title: {title}")
    print(f"   Message: {message}")
    print(f"   Channel: {channel} | Time: {datetime.datetime.utcnow().isoformat()}\n")

    notif_data = {
        "user_id": user_id,
        "event_type": event_type,
        "title": title,
        "message": message,
        "channel": channel,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

    if db:
        try:
            db_notif = Notification(
                user_id=user_id,
                event_type=event_type,
                title=title,
                message=message,
                is_read=False
            )
            db.add(db_notif)
            db.commit()
            db.refresh(db_notif)
            notif_data["id"] = db_notif.id
        except Exception as e:
            print(f"[NLAMS Notification Error] Could not persist to DB: {e}")
            db.rollback()

    return notif_data
