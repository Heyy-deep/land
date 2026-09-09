import os
import shutil
from typing import BinaryIO
from fastapi import UploadFile

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class BaseStorageBackend:
    """Interface for swappable document storage backends (Local Disk, AWS S3, MeghRaj, Azure)."""
    def save(self, file_obj: BinaryIO, filename: str) -> str:
        raise NotImplementedError

    def get_url(self, filename: str) -> str:
        raise NotImplementedError

class LocalDiskStorage(BaseStorageBackend):
    def __init__(self, base_dir: str = UPLOAD_DIR):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    def save(self, file_obj: BinaryIO, filename: str) -> str:
        file_path = os.path.join(self.base_dir, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file_obj, buffer)
        return f"/uploads/{filename}"

    def get_url(self, filename: str) -> str:
        return f"/uploads/{filename}"

# Default active storage backend
storage_backend: BaseStorageBackend = LocalDiskStorage()

def save_uploaded_file(upload_file: UploadFile, custom_filename: str = None) -> str:
    filename = custom_filename or upload_file.filename
    # Sanitize filename
    safe_filename = "".join(c for c in filename if c.isalnum() or c in (".", "_", "-"))
    return storage_backend.save(upload_file.file, safe_filename)
