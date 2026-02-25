from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from app.core.config import settings

_is_postgres = settings.DATABASE_URL.startswith("postgresql")

# NullPool: don't maintain a SQLAlchemy connection pool.
# Supabase's Transaction Pooler (pgBouncer) handles pooling externally.
# This avoids DuplicatePreparedStatementError caused by long-lived connections.
# ssl=require: Supabase mandates SSL.
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    poolclass=NullPool if _is_postgres else None,
    connect_args={"ssl": "require"} if _is_postgres else {},
)

# Create async session factory
async_session = sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)


async def get_session() -> AsyncSession:
    """Dependency for getting async database sessions."""
    async with async_session() as session:
        yield session


async def init_db():
    """Create all database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
