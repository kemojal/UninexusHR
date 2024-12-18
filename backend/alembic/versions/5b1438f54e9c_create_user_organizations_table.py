"""create user organizations table

Revision ID: 5b1438f54e9c
Revises: 0afa4a043f8f
Create Date: 2024-12-11 17:19:10.038565

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5b1438f54e9c'
down_revision: Union[str, None] = '0afa4a043f8f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create user_organizations table
    op.create_table('user_organizations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('organization_id', sa.Integer(), nullable=True),
        sa.Column('role', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Add back industry column if it was removed
    op.execute('ALTER TABLE organizations ADD COLUMN IF NOT EXISTS industry VARCHAR')


def downgrade() -> None:
    # Drop user_organizations table
    op.drop_table('user_organizations')
    # Drop industry column
    op.execute('ALTER TABLE organizations DROP COLUMN IF EXISTS industry')
