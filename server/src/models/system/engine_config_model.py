from dataclasses import dataclass
from typing import Dict, Any, Optional

@dataclass
class EngineConfig:
    """Domain model representing NLP Engine Configuration entity."""
    threshold: float = 0.3
    adaptive_alpha_threshold: int = 15
    is_adaptive: bool = True
    manual_alpha: float = 0.7
    weight_keahlian: int = 5
    weight_publikasi: int = 2
    weight_bimbingan: int = 1
    weight_pengujian: int = 1
    bm25_k1: float = 1.5
    bm25_b: float = 0.75
    adaptive_short_alpha: float = 0.70
    adaptive_long_alpha: float = 0.35
    strict_prodi: bool = False
    top_k: int = 5
    id: Optional[int] = None
    updated_at: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "threshold": float(self.threshold),
            "adaptive_alpha_threshold": int(self.adaptive_alpha_threshold),
            "is_adaptive": bool(self.is_adaptive),
            "manual_alpha": float(self.manual_alpha),
            "weight_keahlian": int(self.weight_keahlian),
            "weight_publikasi": int(self.weight_publikasi),
            "weight_bimbingan": int(self.weight_bimbingan),
            "weight_pengujian": int(self.weight_pengujian),
            "bm25_k1": float(self.bm25_k1),
            "bm25_b": float(self.bm25_b),
            "adaptive_short_alpha": float(self.adaptive_short_alpha),
            "adaptive_long_alpha": float(self.adaptive_long_alpha),
            "strict_prodi": bool(self.strict_prodi),
            "top_k": int(self.top_k),
            "updated_at": str(self.updated_at) if self.updated_at else None
        }
