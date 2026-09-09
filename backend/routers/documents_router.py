import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Document, Project, User
from backend.auth import get_current_user
from backend.storage import save_uploaded_file

router = APIRouter(prefix="/projects", tags=["Documents & Archival"])

@router.post("/{id}/documents", status_code=status.HTTP_201_CREATED)
async def upload_project_document(
    id: str,
    doc_type: str = Form("General Document"),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Uploads document with automatic version control and storage abstraction."""
    proj = db.query(Project).filter(Project.id == id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    # Determine next version
    latest_doc = (
        db.query(Document)
        .filter(Document.project_id == id, Document.type == doc_type)
        .order_by(Document.version.desc())
        .first()
    )
    version = (latest_doc.version + 1) if latest_doc else 1

    filename = f"{id}_{doc_type.replace(' ', '_')}_v{version}_{file.filename}"
    file_url = save_uploaded_file(file, filename)

    doc = Document(
        project_id=id,
        type=doc_type,
        file_name=file.filename,
        file_url=file_url,
        version=version,
        uploaded_by=current_user.full_name
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return {
        "status": "success",
        "document_id": doc.id,
        "project_id": id,
        "type": doc_type,
        "version": version,
        "file_url": file_url
    }

@router.get("/{id}/documents")
def list_project_documents(id: str, db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.project_id == id).order_by(Document.uploaded_at.desc()).all()
    return docs
