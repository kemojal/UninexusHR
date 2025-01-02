"""add organization_id to user_roles

Revision ID: f5b2c3d4e5a6
Revises: 79539c1736f4
Create Date: 2024-12-18 19:52:30.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f5b2c3d4e5a6'
down_revision: Union[str, None] = '79539c1736f4'  # Points to add_invited_by_to_invitations
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # First, get all existing user_roles entries
    connection = op.get_bind()
    user_roles = sa.Table(
        'user_roles',
        sa.MetaData(),
        sa.Column('user_id', sa.Integer),
        sa.Column('role_id', sa.Integer)
    )
    existing_entries = connection.execute(sa.select(user_roles)).fetchall()
    
    # Drop existing primary key if any
    op.drop_constraint('user_roles_pkey', 'user_roles', type_='primary')
    
    # Add organization_id column
    op.add_column('user_roles', sa.Column('organization_id', sa.Integer()))
    
    # Add foreign key constraint
    op.create_foreign_key(
        'fk_user_roles_organization_id', 'user_roles', 'organizations',
        ['organization_id'], ['id']
    )
    
    # Update existing entries to set organization_id from the roles table
    roles = sa.Table(
        'roles',
        sa.MetaData(),
        sa.Column('id', sa.Integer),
        sa.Column('organization_id', sa.Integer)
    )
    
    for user_id, role_id in existing_entries:
        # Get organization_id from roles table
        role = connection.execute(
            sa.select(roles.c.organization_id)
            .where(roles.c.id == role_id)
        ).first()
        
        if role and role[0]:
            connection.execute(
                sa.text(
                    'UPDATE user_roles SET organization_id = :org_id '
                    'WHERE user_id = :user_id AND role_id = :role_id'
                ),
                {"org_id": role[0], "user_id": user_id, "role_id": role_id}
            )
    
    # Make organization_id not nullable after setting values
    op.alter_column('user_roles', 'organization_id', nullable=False)
    
    # Create new composite primary key
    op.create_primary_key(
        'user_roles_pkey', 'user_roles',
        ['user_id', 'role_id', 'organization_id']
    )


def downgrade() -> None:
    # Drop the new primary key
    op.drop_constraint('user_roles_pkey', 'user_roles', type_='primary')
    
    # Drop the foreign key constraint
    op.drop_constraint('fk_user_roles_organization_id', 'user_roles', type_='foreignkey')
    
    # Drop the organization_id column
    op.drop_column('user_roles', 'organization_id')
    
    # Recreate original primary key
    op.create_primary_key(
        'user_roles_pkey', 'user_roles',
        ['user_id', 'role_id']
    )
