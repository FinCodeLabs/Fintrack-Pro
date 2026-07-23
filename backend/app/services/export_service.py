import csv
import io
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.transaction_repository import TransactionRepository


class ExportService:
    def __init__(self, session: AsyncSession):
        self.tx_repo = TransactionRepository(session)

    async def export_transactions_csv(self, user_id: int) -> str:
        txs, _ = await self.tx_repo.get_multi_with_filters(user_id, page=1, size=1000)
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "ID", "Date", "Type", "Category", "Amount ($)", "Description", "Location", "Is Recurring"
        ])
        for tx in txs:
            amount_dollars = f"{tx['amount_cents'] / 100:.2f}"
            writer.writerow([
                tx["id"],
                tx["transaction_date"],
                tx["type"].upper(),
                tx["category_name"] or "Uncategorized",
                amount_dollars,
                tx["description"] or "",
                tx["location"] or "",
                "Yes" if tx["is_recurring"] else "No",
            ])
        return output.getvalue()
