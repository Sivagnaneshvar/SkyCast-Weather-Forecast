"""
Thread-safe in-memory cache with Time-To-Live (TTL) expiration.
"""
import time
import threading
from typing import Any, Optional

class TTLCache:
    def __init__(self, default_ttl: int = 600):
        self._default_ttl = default_ttl
        self._cache = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            record = self._cache.get(key)
            if not record:
                return None
            val, expiry = record
            if time.time() > expiry:
                del self._cache[key]
                return None
            return val

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        effective_ttl = ttl if ttl is not None else self._default_ttl
        expiry = time.time() + effective_ttl
        with self._lock:
            self._cache[key] = (value, expiry)

    def delete(self, key: str) -> bool:
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                return True
            return False

    def clear(self) -> None:
        with self._lock:
            self._cache.clear()

    def size(self) -> int:
        with self._lock:
            # Clean expired items on size check
            now = time.time()
            expired_keys = [k for k, (_, exp) in self._cache.items() if now > exp]
            for k in expired_keys:
                del self._cache[k]
            return len(self._cache)

# Global cache singletons
weather_cache = TTLCache(default_ttl=600)
geocoding_cache = TTLCache(default_ttl=86400)
