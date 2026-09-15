from typing import Optional, Dict, Any
from server.database.connection.database import DatabaseManager
from server.src.models.system.engine_config_model import EngineConfig
from server.src.config.logging_config import logger

class EngineConfigRepository:
    """Repository layer for engine_configs table."""
    
    @staticmethod
    def get_latest_config() -> Optional[EngineConfig]:
        conn = DatabaseManager.get_connection()
        if not conn:
            return None
            
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, threshold, adaptive_alpha_threshold, is_adaptive, manual_alpha, 
                       weight_keahlian, weight_publikasi, weight_bimbingan, weight_pengujian,
                       bm25_k1, bm25_b, adaptive_short_alpha, adaptive_long_alpha, strict_prodi, top_k, updated_at 
                FROM engine_configs 
                ORDER BY id DESC LIMIT 1
            """)
            row = cursor.fetchone()
            cursor.close()
            
            if not row:
                return None
                
            if isinstance(row, dict):
                return EngineConfig(
                    id=row.get('id'),
                    threshold=float(row.get('threshold', 0.3)),
                    adaptive_alpha_threshold=int(row.get('adaptive_alpha_threshold', 15)),
                    is_adaptive=bool(row.get('is_adaptive', True)),
                    manual_alpha=float(row.get('manual_alpha', 0.7)),
                    weight_keahlian=int(row.get('weight_keahlian', 5)),
                    weight_publikasi=int(row.get('weight_publikasi', 2)),
                    weight_bimbingan=int(row.get('weight_bimbingan', 1)),
                    weight_pengujian=int(row.get('weight_pengujian', 1)),
                    bm25_k1=float(row.get('bm25_k1', 1.5)),
                    bm25_b=float(row.get('bm25_b', 0.75)),
                    adaptive_short_alpha=float(row.get('adaptive_short_alpha', 0.70)),
                    adaptive_long_alpha=float(row.get('adaptive_long_alpha', 0.35)),
                    strict_prodi=bool(row.get('strict_prodi', False)),
                    top_k=int(row.get('top_k', 5)),
                    updated_at=str(row.get('updated_at')) if row.get('updated_at') else None
                )
            else:
                return EngineConfig(
                    id=row[0],
                    threshold=float(row[1]) if len(row) > 1 and row[1] is not None else 0.3,
                    adaptive_alpha_threshold=int(row[2]) if len(row) > 2 and row[2] is not None else 15,
                    is_adaptive=bool(row[3]) if len(row) > 3 and row[3] is not None else True,
                    manual_alpha=float(row[4]) if len(row) > 4 and row[4] is not None else 0.7,
                    weight_keahlian=int(row[5]) if len(row) > 5 and row[5] is not None else 5,
                    weight_publikasi=int(row[6]) if len(row) > 6 and row[6] is not None else 2,
                    weight_bimbingan=int(row[7]) if len(row) > 7 and row[7] is not None else 1,
                    weight_pengujian=int(row[8]) if len(row) > 8 and row[8] is not None else 1,
                    bm25_k1=float(row[9]) if len(row) > 9 and row[9] is not None else 1.5,
                    bm25_b=float(row[10]) if len(row) > 10 and row[10] is not None else 0.75,
                    adaptive_short_alpha=float(row[11]) if len(row) > 11 and row[11] is not None else 0.70,
                    adaptive_long_alpha=float(row[12]) if len(row) > 12 and row[12] is not None else 0.35,
                    strict_prodi=bool(row[13]) if len(row) > 13 and row[13] is not None else False,
                    top_k=int(row[14]) if len(row) > 14 and row[14] is not None else 5,
                    updated_at=str(row[15]) if len(row) > 15 and row[15] is not None else None
                )
        except Exception as e:
            logger.error(f"EngineConfigRepository.get_latest_config error: {e}")
            return None
        finally:
            conn.close()

    @staticmethod
    def save_config(config_data: Dict[str, Any]) -> EngineConfig:
        conn = DatabaseManager.get_connection()
        if not conn:
            raise RuntimeError("Database connection not available")
            
        try:
            cursor = conn.cursor()
            driver = DatabaseManager.get_driver()
            param_char = '%s' if driver == 'mysql' and hasattr(conn, 'cmd_query') else '?'
            
            existing = EngineConfigRepository.get_latest_config()
            
            threshold = float(config_data.get('threshold', 0.3))
            adaptive_alpha = int(config_data.get('adaptive_alpha_threshold', 15))
            is_adaptive = 1 if config_data.get('is_adaptive', True) else 0
            manual_alpha = float(config_data.get('manual_alpha', 0.7))
            w_keahlian = int(config_data.get('weight_keahlian', 5))
            w_pub = int(config_data.get('weight_publikasi', 2))
            w_bimb = int(config_data.get('weight_bimbingan', 1))
            w_uji = int(config_data.get('weight_pengujian', 1))
            bm25_k1 = float(config_data.get('bm25_k1', 1.5))
            bm25_b = float(config_data.get('bm25_b', 0.75))
            short_alpha = float(config_data.get('adaptive_short_alpha', 0.70))
            long_alpha = float(config_data.get('adaptive_long_alpha', 0.35))
            strict_prodi = 1 if config_data.get('strict_prodi', False) else 0
            top_k = int(config_data.get('top_k', 5))
            
            params = (
                threshold, adaptive_alpha, is_adaptive, manual_alpha,
                w_keahlian, w_pub, w_bimb, w_uji,
                bm25_k1, bm25_b, short_alpha, long_alpha, strict_prodi, top_k
            )
            
            if existing and existing.id:
                sql = f"""
                    UPDATE engine_configs SET 
                        threshold={param_char}, adaptive_alpha_threshold={param_char}, is_adaptive={param_char}, manual_alpha={param_char},
                        weight_keahlian={param_char}, weight_publikasi={param_char}, weight_bimbingan={param_char}, weight_pengujian={param_char},
                        bm25_k1={param_char}, bm25_b={param_char}, adaptive_short_alpha={param_char}, adaptive_long_alpha={param_char},
                        strict_prodi={param_char}, top_k={param_char}
                    WHERE id={param_char}
                """
                cursor.execute(sql, (*params, existing.id))
            else:
                sql = f"""
                    INSERT INTO engine_configs (
                        threshold, adaptive_alpha_threshold, is_adaptive, manual_alpha,
                        weight_keahlian, weight_publikasi, weight_bimbingan, weight_pengujian,
                        bm25_k1, bm25_b, adaptive_short_alpha, adaptive_long_alpha, strict_prodi, top_k
                    ) VALUES ({', '.join([param_char]*14)})
                """
                cursor.execute(sql, params)
                
            conn.commit()
            cursor.close()
            
            return EngineConfig(
                threshold=threshold,
                adaptive_alpha_threshold=adaptive_alpha,
                is_adaptive=bool(is_adaptive),
                manual_alpha=manual_alpha,
                weight_keahlian=w_keahlian,
                weight_publikasi=w_pub,
                weight_bimbingan=w_bimb,
                weight_pengujian=w_uji,
                bm25_k1=bm25_k1,
                bm25_b=bm25_b,
                adaptive_short_alpha=short_alpha,
                adaptive_long_alpha=long_alpha,
                strict_prodi=bool(strict_prodi),
                top_k=top_k
            )
        except Exception as e:
            logger.error(f"EngineConfigRepository.save_config error: {e}")
            raise e
        finally:
            conn.close()
