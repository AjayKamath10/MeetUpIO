from sqlmodel import SQLModel, create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Connect args for Supabase compatibility:
# - ssl=require: Supabase requires SSL connections
# - statement_cache_size=0: Transaction mode pooler (pgBouncer) doesn't support prepared statements
_connect_args = {}
if settings.DATABASE_URL.startswith("postgresql"):
    _connect_args = {
        "ssl": "require",
        "statement_cache_size": 0,
    }

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    connect_args=_connect_args,
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
