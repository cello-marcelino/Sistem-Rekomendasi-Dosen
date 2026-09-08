import json
from dataclasses import dataclass, asdict
from datetime import datetime

@dataclass
class Client:
    id: int
    client_id: str
    name: str
    email: str
    organization: str
    password_hash: str
    api_key: str
    is_active: bool
    created_at: str
    updated_at: str

    def to_dict(self, exclude_password=True):
        d = asdict(self)
        if exclude_password:
            d.pop("password_hash", None)
        return d

