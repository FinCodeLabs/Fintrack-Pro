import asyncio
from datetime import date, datetime, timedelta

from app.core.database import AsyncSessionLocal, engine
from app.core.security import hash_password
from app.models.base import Base
from app.models.category import Category
from app.models.user import User
from app.models.transaction import Transaction, TransactionType
from app.models.budget import Budget
from app.models.savings_goal import SavingsGoal
from app.models.financial_insight import FinancialInsight


SYSTEM_CATEGORIES = [
    {"name": "Salary", "icon": "💰", "color": "#10B981", "type": "income", "sort_order": 1},
    {"name": "Freelance", "icon": "💻", "color": "#3B82F6", "type": "income", "sort_order": 2},
    {"name": "Investments", "icon": "📈", "color": "#8B5CF6", "type": "income", "sort_order": 3},
    {"name": "Housing & Rent", "icon": "🏠", "color": "#EF4444", "type": "expense", "sort_order": 4},
    {"name": "Groceries & Food", "icon": "🛒", "color": "#F59E0B", "type": "expense", "sort_order": 5},
    {"name": "Dining & Cafes", "icon": "🍔", "color": "#EC4899", "type": "expense", "sort_order": 6},
    {"name": "Transportation", "icon": "🚗", "color": "#06B6D4", "type": "expense", "sort_order": 7},
    {"name": "Utilities & Bills", "icon": "⚡", "color": "#6366F1", "type": "expense", "sort_order": 8},
    {"name": "Entertainment", "icon": "🎬", "color": "#14B8A6", "type": "expense", "sort_order": 9},
    {"name": "Shopping", "icon": "🛍️", "color": "#84CC16", "type": "expense", "sort_order": 10},
    {"name": "Health & Fitness", "icon": "🏥", "color": "#F43F5E", "type": "expense", "sort_order": 11},
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # 1. Seed System Categories
        for cat_data in SYSTEM_CATEGORIES:
            cat = Category(
                name=cat_data["name"],
                icon=cat_data["icon"],
                color=cat_data["color"],
                type=cat_data["type"],
                is_system=True,
                sort_order=cat_data["sort_order"],
            )
            session.add(cat)
        await session.commit()

        # 2. Seed Demo User
        demo_user = User(
            email="demo@fintrackpro.com",
            password_hash=hash_password("DemoPassword123!"),
            full_name="Alex Morgan",
            default_currency="USD",
            is_active=True,
            is_onboarding_completed=True,
        )
        session.add(demo_user)
        await session.commit()

        # Fetch category IDs
        categories = (await session.execute(Category.__table__.select())).all()
        cat_map = {c.name: c.id for c in categories}

        # 3. Seed Demo Transactions
        today = date.today()
        transactions_data = [
            {"amount": 450000, "type": TransactionType.INCOME, "cat": "Salary", "desc": "Monthly Salary Paycheck", "days_ago": 2},
            {"amount": 75000, "type": TransactionType.INCOME, "cat": "Freelance", "desc": "UI Design Project Consultancy", "days_ago": 10},
            {"amount": 140000, "type": TransactionType.EXPENSE, "cat": "Housing & Rent", "desc": "Apartment Monthly Rent", "days_ago": 3},
            {"amount": 24550, "type": TransactionType.EXPENSE, "cat": "Groceries & Food", "desc": "Whole Foods Organic Groceries", "days_ago": 1},
            {"amount": 6800, "type": TransactionType.EXPENSE, "cat": "Dining & Cafes", "desc": "Dinner at Bistro Italian", "days_ago": 4},
            {"amount": 12500, "type": TransactionType.EXPENSE, "cat": "Utilities & Bills", "desc": "Electric & Internet Bill", "days_ago": 7},
            {"amount": 4500, "type": TransactionType.EXPENSE, "cat": "Transportation", "desc": "Fuel refill & Metro Pass", "days_ago": 5},
            {"amount": 18000, "type": TransactionType.EXPENSE, "cat": "Shopping", "desc": "New Nike Running Shoes", "days_ago": 12},
            {"amount": 3500, "type": TransactionType.EXPENSE, "cat": "Entertainment", "desc": "Movie Tickets & Popcorn", "days_ago": 8},
        ]

        for tx in transactions_data:
            t = Transaction(
                user_id=demo_user.id,
                category_id=cat_map.get(tx["cat"]),
                amount_cents=tx["amount"],
                type=tx["type"],
                description=tx["desc"],
                transaction_date=today - timedelta(days=tx["days_ago"]),
            )
            session.add(t)

        # 4. Seed Demo Budgets
        budgets_data = [
            {"cat": "Groceries & Food", "limit": 60000},
            {"cat": "Dining & Cafes", "limit": 30000},
            {"cat": "Transportation", "limit": 20000},
            {"cat": "Entertainment", "limit": 15000},
            {"cat": "Shopping", "limit": 35000},
        ]
        for b in budgets_data:
            budget = Budget(
                user_id=demo_user.id,
                category_id=cat_map.get(b["cat"]),
                month=today.month,
                year=today.year,
                limit_cents=b["limit"],
                alert_threshold=80,
            )
            session.add(budget)

        # 5. Seed Demo Savings Goals
        goals = [
            SavingsGoal(
                user_id=demo_user.id,
                name="Emergency Fund",
                description="6 months of living expenses buffer",
                icon="🛡️",
                target_cents=1000000,
                current_cents=650000,
                deadline=today + timedelta(days=180),
                auto_save=True,
            ),
            SavingsGoal(
                user_id=demo_user.id,
                name="Japan Vacation Trip",
                description="Tokyo & Kyoto autumn cherry blossom tour",
                icon="🏯",
                target_cents=350000,
                current_cents=180000,
                deadline=today + timedelta(days=120),
            ),
            SavingsGoal(
                user_id=demo_user.id,
                name="M3 Macbook Pro",
                description="Workstation upgrade for software engineering",
                icon="💻",
                target_cents=250000,
                current_cents=210000,
                deadline=today + timedelta(days=45),
            ),
        ]
        for g in goals:
            session.add(g)

        # 6. Seed Demo Insights
        insights = [
            FinancialInsight(
                user_id=demo_user.id,
                category="savings",
                title="Strong Savings Benchmark",
                message="You saved 32% of total earnings this month! Your emergency fund is 65% complete.",
                severity="info",
                generated_at=datetime.now(),
            ),
            FinancialInsight(
                user_id=demo_user.id,
                category="budget",
                title="Dining Out Alert",
                message="Dining & Cafes spending is at 68% of monthly limit with 18 days remaining.",
                severity="warning",
                generated_at=datetime.now(),
            ),
        ]
        for ins in insights:
            session.add(ins)

        await session.commit()
        print("Database seeded successfully with demo data!")


if __name__ == "__main__":
    asyncio.run(seed())
