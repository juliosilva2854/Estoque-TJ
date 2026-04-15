from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

logger = logging.getLogger(__name__)

class AuditLogger:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
    
    async def log(
        self,
        user_id: str,
        user_email: str,
        action: str,
        entity_type: str,
        entity_id: str,
        changes: dict = None,
        ip_address: str = None
    ):
        """Log an audit event"""
        try:
            log_entry = {
                "user_id": user_id,
                "user_email": user_email,
                "action": action,
                "entity_type": entity_type,
                "entity_id": entity_id,
                "changes": changes,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "ip_address": ip_address
            }
            await self.db.audit_logs.insert_one(log_entry)
        except Exception as e:
            logger.error(f"Failed to create audit log: {e}")