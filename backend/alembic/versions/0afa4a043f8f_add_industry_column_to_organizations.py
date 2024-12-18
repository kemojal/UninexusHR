"""add industry column to organizations

Revision ID: 0afa4a043f8f
Revises: 55ba1b0ac5a4
Create Date: 2024-12-11 17:16:13.038565

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0afa4a043f8f'
down_revision: Union[str, None] = '55ba1b0ac5a4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add industry column to organizations table
    op.execute('ALTER TABLE organizations ADD COLUMN IF NOT EXISTS industry VARCHAR')


def downgrade() -> None:
    # Drop industry column from organizations
    op.execute('ALTER TABLE organizations DROP COLUMN IF EXISTS industry')
