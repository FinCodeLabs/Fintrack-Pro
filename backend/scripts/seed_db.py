"""Seed database with default categories."""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.core.config import settings
from app.models.category import Category

DEFAULT_CATEGORIES = [
    # Income
    {"name": "Salary", "icon": "💼", "color": "#10B981", "type": "income", "sort_order": 1},
    {"name": "Business", "icon": "🏢", "color": "#3B82F6", "type": "income", "sort_order": 2},
    {"name": "Freelancing", "icon": "💻", "color": "#8B5CF6", "type": "income", "sort_order": 3},
    {"name": "Investments", "icon": "📊", "color": "#06B6D4", "type": "income", "sort_order": 4},
    {"name": "Rental", "icon": "🏠", "color": "#EC4899", "type": "income", "sort_order": 5},
    {"name": "Other Income", "icon": "💰", "color": "#6B7280", "type": "income", "sort_order": 6},
    # Expense
    {"name": "Food & Dining", "icon": "🍽️", "color": "#EF4444", "type": "expense", "sort_order": 1},
    {"name": "Shopping", "icon": "🛍️", "color": "#F97316", "type": "expense", "sort_order": 2},
    {"name": "Travel", "icon": "✈️", "color": "#06B6D4", "type": "expense", "sort_order": 3},
    {"name": "Fuel", "icon": "⛽", "color": "#F59E0B", "type": "expense", "sort_order": 4},
    {"name": "Entertainment", "icon": "🎬", "color": "#8B5CF6", "type": "expense", "sort_order": 5},
    {"name": "Bills & Utilities", "icon": "📄", "color": "#3B82F6", "type": "expense", "sort_order": 6},
    {"name": "Education", "icon": "📚", "color": "#10B981", "type": "expense", "sort_order": 7},
    {"name": "Medical", "icon": "🏥", "color": "#EC4899", "type": "expense", "sort_order": 8},
    {"name": "Subscriptions", "icon": "📱", "color": "#6366F1", "type": "expense", "sort_order": 9},
    {"name": "Groceries", "icon": "🛒", "color": "#84CC16", "type": "expense", "sort_order": 10},
    {"name": "Rent", "icon": "🏠", "color": "#E11D48", "type": "expense", "sort_order": 11},
    {"name": "Others", "icon": "📦", "color": "#6B7280", "type": "expense", "sort_order": 12},
]


async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with SessionLocal() as session:
        from sqlalchemy import select
        for cat in DEFAULT_CATEGORIES:
            query = select(Category).where(
                Category.name == cat["name"],
                Category.type == cat["type"],
                Category.is_system == True,
            )
            result = await session.execute(query)
            existing = result.scalar_one_or_none()
            if not existing:
                session.add(Category(
                    name=cat["name"],
                    icon=cat["icon"],
                    color=cat["color"],
                    type=cat["type"],
                    is_system=True,
                    sort_order=cat["sort_order"],
                    user_id=None,
                ))
        await session.commit()
        print("✅ Categories seeded!")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
