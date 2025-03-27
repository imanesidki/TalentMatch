"""Add component scores to Score model

Revision ID: add_component_scores
Revises: 
Create Date: 2025-03-27 14:28:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_component_scores'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add component score columns to the scores table
    op.add_column('scores', sa.Column('score_education', sa.Float(), nullable=True))
    op.add_column('scores', sa.Column('score_experience', sa.Float(), nullable=True))
    op.add_column('scores', sa.Column('score_skills', sa.Float(), nullable=True))


def downgrade() -> None:
    # Drop component score columns from the scores table
    op.drop_column('scores', 'score_skills')
    op.drop_column('scores', 'score_experience')
    op.drop_column('scores', 'score_education')
