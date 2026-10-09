"""Initial CBA Schema: Users, Agents, Wallets, Ledger, Transactions, Policies, Invoices, Audit

Revision ID: 001_initial_cba_schema
Revises: 
Create Date: 2026-10-09

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_cba_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Users
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('email', sa.String(length=255), unique=True, nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=32), nullable=False, server_default='operator'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )

    # Agents
    op.create_table(
        'agents',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('owner_id', sa.String(length=36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('name', sa.String(length=128), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='ACTIVE'),
        sa.Column('public_key', sa.Text(), nullable=True),
        sa.Column('metadata_json', sa.Text(), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )

    # Agent Credentials
    op.create_table(
        'agent_credentials',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('agent_id', sa.String(length=64), sa.ForeignKey('agents.id'), nullable=False),
        sa.Column('key_prefix', sa.String(length=16), nullable=False),
        sa.Column('key_hash', sa.String(length=64), nullable=False),
        sa.Column('scopes', sa.String(length=255), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False)
    )

    # Wallets
    op.create_table(
        'wallets',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('agent_id', sa.String(length=64), sa.ForeignKey('agents.id'), nullable=True, unique=True),
        sa.Column('wallet_type', sa.String(length=32), nullable=False, server_default='AGENT'),
        sa.Column('currency', sa.String(length=12), nullable=False, server_default='CBAC'),
        sa.Column('cached_balance', sa.Numeric(precision=20, scale=6), nullable=False, server_default='0.000000'),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='ACTIVE'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )

    # Ledger Accounts
    op.create_table(
        'ledger_accounts',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('account_number', sa.String(length=64), unique=True, nullable=False),
        sa.Column('wallet_id', sa.String(length=64), sa.ForeignKey('wallets.id'), nullable=True, unique=True),
        sa.Column('account_type', sa.String(length=32), nullable=False),
        sa.Column('normal_balance', sa.String(length=8), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False)
    )

    # Transactions
    op.create_table(
        'transactions',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('idempotency_key', sa.String(length=128), unique=True, nullable=False),
        sa.Column('sender_wallet_id', sa.String(length=64), sa.ForeignKey('wallets.id'), nullable=False),
        sa.Column('recipient_wallet_id', sa.String(length=64), sa.ForeignKey('wallets.id'), nullable=False),
        sa.Column('amount', sa.Numeric(precision=20, scale=6), nullable=False),
        sa.Column('fee_amount', sa.Numeric(precision=20, scale=6), nullable=False, server_default='0.000000'),
        sa.Column('currency', sa.String(length=12), nullable=False, server_default='CBAC'),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='PENDING'),
        sa.Column('transaction_type', sa.String(length=32), nullable=False, server_default='TRANSFER'),
        sa.Column('reference_tx_id', sa.String(length=64), sa.ForeignKey('transactions.id'), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('metadata_json', sa.Text(), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('settled_at', sa.DateTime(timezone=True), nullable=True)
    )

    # Ledger Entries
    op.create_table(
        'ledger_entries',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('transaction_id', sa.String(length=64), sa.ForeignKey('transactions.id'), nullable=False),
        sa.Column('ledger_account_id', sa.String(length=64), sa.ForeignKey('ledger_accounts.id'), nullable=False),
        sa.Column('entry_type', sa.String(length=8), nullable=False),
        sa.Column('amount', sa.Numeric(precision=20, scale=6), nullable=False),
        sa.Column('previous_entry_hash', sa.String(length=64), nullable=True),
        sa.Column('entry_hash', sa.String(length=64), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False)
    )

    # Spending Policies
    op.create_table(
        'spending_policies',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('agent_id', sa.String(length=64), sa.ForeignKey('agents.id'), unique=True, nullable=False),
        sa.Column('max_amount_per_tx', sa.Numeric(precision=20, scale=6), nullable=False),
        sa.Column('daily_spending_limit', sa.Numeric(precision=20, scale=6), nullable=False),
        sa.Column('monthly_spending_limit', sa.Numeric(precision=20, scale=6), nullable=False),
        sa.Column('human_approval_threshold', sa.Numeric(precision=20, scale=6), nullable=False),
        sa.Column('allowed_counterparties_json', sa.Text(), nullable=False, server_default='"ALL"'),
        sa.Column('emergency_freeze', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )

    # Payment Requests
    op.create_table(
        'payment_requests',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('requester_agent_id', sa.String(length=64), sa.ForeignKey('agents.id'), nullable=False),
        sa.Column('payer_agent_id', sa.String(length=64), sa.ForeignKey('agents.id'), nullable=False),
        sa.Column('amount', sa.Numeric(precision=20, scale=6), nullable=False),
        sa.Column('currency', sa.String(length=12), nullable=False, server_default='CBAC'),
        sa.Column('service_code', sa.String(length=64), nullable=False),
        sa.Column('service_description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='PENDING'),
        sa.Column('transaction_id', sa.String(length=64), sa.ForeignKey('transactions.id'), nullable=True, unique=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False)
    )

    # Audit Events
    op.create_table(
        'audit_events',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('actor_type', sa.String(length=32), nullable=False),
        sa.Column('actor_id', sa.String(length=64), nullable=False),
        sa.Column('action', sa.String(length=64), nullable=False),
        sa.Column('resource_type', sa.String(length=64), nullable=False),
        sa.Column('resource_id', sa.String(length=64), nullable=False),
        sa.Column('ip_address', sa.String(length=64), nullable=True),
        sa.Column('details_json', sa.Text(), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False)
    )

def downgrade() -> None:
    op.drop_table('audit_events')
    op.drop_table('payment_requests')
    op.drop_table('spending_policies')
    op.drop_table('ledger_entries')
    op.drop_table('transactions')
    op.drop_table('ledger_accounts')
    op.drop_table('wallets')
    op.drop_table('agent_credentials')
    op.drop_table('agents')
    op.drop_table('users')
