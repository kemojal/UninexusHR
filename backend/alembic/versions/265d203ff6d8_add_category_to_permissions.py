"""add category to permissions

Revision ID: 265d203ff6d8
Revises: 5b1438f54e9c
Create Date: 2024-12-13 13:01:50.252723

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '265d203ff6d8'
down_revision: Union[str, None] = '5b1438f54e9c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add category column with default value
    op.add_column('permissions', sa.Column('category', sa.String(), server_default='other', nullable=False))


def downgrade() -> None:
    # Remove category column
    op.drop_column('permissions', 'category')