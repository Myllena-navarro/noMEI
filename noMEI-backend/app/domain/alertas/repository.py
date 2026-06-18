from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId

from app.core.database import get_database


class AlertaRepository:
    @property
    def collection(self):
        return get_database()["alertas"]

    def _serialize(self, doc: dict) -> dict:
        doc["_id"] = str(doc["_id"])
        if isinstance(doc.get("date"), datetime):
            doc["date"] = doc["date"].isoformat()
        return doc

    async def list_by_user(self, user_id: str) -> list[dict]:
        cursor = self.collection.find({"user_id": user_id}).sort("date", -1)
        docs = await cursor.to_list(length=100)
        return [self._serialize(d) for d in docs]

    async def exists(self, user_id: str, alerta_type: str, contratacao_id: str) -> bool:
        doc = await self.collection.find_one({
            "user_id": user_id,
            "type": alerta_type,
            "contratacao_id": contratacao_id,
        })
        return doc is not None

    async def create(self, alerta_data: dict) -> dict:
        result = await self.collection.insert_one(alerta_data)
        doc = await self.collection.find_one({"_id": result.inserted_id})
        return self._serialize(doc)

    async def mark_as_read(self, alerta_id: str, user_id: str) -> bool:
        try:
            oid = ObjectId(alerta_id)
        except InvalidId:
            return False
        result = await self.collection.update_one(
            {"_id": oid, "user_id": user_id},
            {"$set": {"read": True}},
        )
        return result.matched_count > 0

    async def mark_all_as_read(self, user_id: str) -> int:
        result = await self.collection.update_many(
            {"user_id": user_id, "read": False},
            {"$set": {"read": True}},
        )
        return result.modified_count
