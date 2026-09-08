/*
# AgentForge — RLS Policies

## Overview
Adds row-level security policies to all six tables created in the previous migration.

## Security Model

- `agents`: Public-readable catalog (anon + authenticated SELECT). Admin-only writes.
- `customers`: Owner can read/update own profile. Admins can read/update all. Self-insert on signup.
- `deployments`: Owner-scoped CRUD. Admins can read and update all.
- `usage_events`: Owner can read/insert own usage. Admins can read all.
- `support_tickets`: Owner-scoped CRUD. Admins can read and update all.
- `revenue_records`: Owner can read own. Admins can read all and insert.

## Admin Detection
Admin access uses: EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.role = 'admin')
*/

-- ===== AGENTS POLICIES =====
DROP POLICY IF EXISTS "public_read_agents" ON agents;
CREATE POLICY "public_read_agents" ON agents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_agents" ON agents;
CREATE POLICY "admin_insert_agents" ON agents FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.role = 'admin')
  );

DROP POLICY IF EXISTS "admin_update_agents" ON agents;
CREATE POLICY "admin_update_agents" ON agents FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.role = 'admin')
  );

DROP POLICY IF EXISTS "admin_delete_agents" ON agents;
CREATE POLICY "admin_delete_agents" ON agents FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.role = 'admin')
  );

-- ===== CUSTOMERS POLICIES =====
DROP POLICY IF EXISTS "select_own_customer" ON customers;
CREATE POLICY "select_own_customer" ON customers FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "admin_select_customers" ON customers;
CREATE POLICY "admin_select_customers" ON customers FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_own_customer" ON customers;
CREATE POLICY "insert_own_customer" ON customers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_customer" ON customers;
CREATE POLICY "update_own_customer" ON customers FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "admin_update_customers" ON customers;
CREATE POLICY "admin_update_customers" ON customers FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.role = 'admin')
  );

-- ===== DEPLOYMENTS POLICIES =====
DROP POLICY IF EXISTS "select_own_deployments" ON deployments;
CREATE POLICY "select_own_deployments" ON deployments FOR SELECT
  TO authenticated USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "admin_select_deployments" ON deployments;
CREATE POLICY "admin_select_deployments" ON deployments FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_own_deployments" ON deployments;
CREATE POLICY "insert_own_deployments" ON deployments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "update_own_deployments" ON deployments;
CREATE POLICY "update_own_deployments" ON deployments FOR UPDATE
  TO authenticated USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "admin_update_deployments" ON deployments;
CREATE POLICY "admin_update_deployments" ON deployments FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.role = 'admin')
  );

DROP POLICY IF EXISTS "delete_own_deployments" ON deployments;
CREATE POLICY "delete_own_deployments" ON deployments FOR DELETE
  TO authenticated USING (auth.uid() = customer_id);

-- ===== USAGE EVENTS POLICIES =====
DROP POLICY IF EXISTS "select_own_usage" ON usage_events;
CREATE POLICY "select_own_usage" ON usage_events FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM deployments d WHERE d.id = usage_events.deployment_id AND d.customer_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_select_usage" ON usage_events;
CREATE POLICY "admin_select_usage" ON usage_events FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_own_usage" ON usage_events;
CREATE POLICY "insert_own_usage" ON usage_events FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM deployments d WHERE d.id = usage_events.deployment_id AND d.customer_id = auth.uid())
  );

-- ===== SUPPORT TICKETS POLICIES =====
DROP POLICY IF EXISTS "select_own_tickets" ON support_tickets;
CREATE POLICY "select_own_tickets" ON support_tickets FOR SELECT
  TO authenticated USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "admin_select_tickets" ON support_tickets;
CREATE POLICY "admin_select_tickets" ON support_tickets FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_own_tickets" ON support_tickets;
CREATE POLICY "insert_own_tickets" ON support_tickets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "update_own_tickets" ON support_tickets;
CREATE POLICY "update_own_tickets" ON support_tickets FOR UPDATE
  TO authenticated USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "admin_update_tickets" ON support_tickets;
CREATE POLICY "admin_update_tickets" ON support_tickets FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.role = 'admin')
  );

-- ===== REVENUE RECORDS POLICIES =====
DROP POLICY IF EXISTS "select_own_revenue" ON revenue_records;
CREATE POLICY "select_own_revenue" ON revenue_records FOR SELECT
  TO authenticated USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "admin_select_revenue" ON revenue_records;
CREATE POLICY "admin_select_revenue" ON revenue_records FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.role = 'admin')
  );

DROP POLICY IF EXISTS "admin_insert_revenue" ON revenue_records;
CREATE POLICY "admin_insert_revenue" ON revenue_records FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.role = 'admin')
  );
