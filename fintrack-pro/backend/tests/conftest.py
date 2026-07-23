import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import get_db_session
from app.core.security import hash_password
from app.main import app
from app.models.base import Base
from app.models.user import User
from app.models.user_settings import UserSettings

TEST_DATABASE_URL = "postgresql+asyncpg://fintrack:fintrack_pass@localhost:5432/fintrack_pro_test"

engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def override_get_db_session():
    async with TestSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def client():
    app.dependency_overrides[get_db_session] = override_get_db_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user():
    async with TestSessionLocal() as session:
        user = User(
            email="test@example.com",
            password_hash=hash_password("TestPass123!"),
            full_name="Test User",
            is_verified=True,
        )
        session.add(user)
        await session.flush()
        settings = UserSettings(user_id=user.id)
        session.add(settings)
        await session.commit()
        yield user
