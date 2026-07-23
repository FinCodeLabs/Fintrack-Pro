from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.core.deps import CurrentUser
from app.services.export_service import ExportService

router = APIRouter(prefix="/export", tags=["Export"])


@router.get("/transactions/csv")
async def export_transactions_csv(
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
):
    service = ExportService(session)
    csv_content = await service.export_transactions_csv(current_user.id)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="fintrack_transactions.csv"'},
    )
