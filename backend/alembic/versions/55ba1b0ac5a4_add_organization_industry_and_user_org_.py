"""add organization industry and user org tables

Revision ID: 55ba1b0ac5a4
Revises: a38ee54a7dd6
Create Date: 2024-12-11 17:12:38.284019

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '55ba1b0ac5a4'
down_revision: Union[str, None] = 'a38ee54a7dd6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add industry column to organizations table
    op.add_column('organizations', sa.Column('industry', sa.String(), nullable=True))

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

    # Migrate existing organization-user relationships
    op.execute("""
        INSERT INTO user_organizations (user_id, organization_id, role, created_at, updated_at)
        SELECT id, organization_id, 'admin', NOW(), NOW()
        FROM users
        WHERE organization_id IS NOT NULL
    """)


def downgrade() -> None:
    # Drop user_organizations table
    op.drop_table('user_organizations')

    # Drop industry column from organizations
    op.drop_column('organizations', 'industry')
