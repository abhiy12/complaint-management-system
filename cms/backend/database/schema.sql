-- =====================================================================
-- Complaint Management System — PostgreSQL schema
-- (Converted from the original MySQL schema for Neon/Supabase deployment)
-- =====================================================================

-- ---------------------------------------------------------------------
-- RBAC
-- ---------------------------------------------------------------------
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255)
);

CREATE TABLE role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE (role_id, permission_id)
);

-- ---------------------------------------------------------------------
-- Vendors
-- ---------------------------------------------------------------------
CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  vendor_code VARCHAR(30) NOT NULL UNIQUE,
  vendor_name VARCHAR(150) NOT NULL,
  company_name VARCHAR(150),
  gst_number VARCHAR(20),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  pin_code VARCHAR(10),
  email VARCHAR(150),
  phone VARCHAR(20),
  contact_person VARCHAR(150),
  logo_path VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_vendor_status ON vendors (status);

-- ---------------------------------------------------------------------
-- Users (base auth identity for every human in the system)
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL REFERENCES roles(id),
  vendor_id INT REFERENCES vendors(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_role ON users (role_id);
CREATE INDEX idx_users_vendor ON users (vendor_id);
CREATE INDEX idx_users_status ON users (status);

CREATE TABLE vendor_users (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  vendor_id INT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  department VARCHAR(100),
  role VARCHAR(20) NOT NULL CHECK (role IN ('vendor_admin', 'vendor_sub_user')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);
CREATE INDEX idx_vu_vendor ON vendor_users (vendor_id);

CREATE TABLE executives (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  employee_id VARCHAR(30) NOT NULL UNIQUE,
  photo_path VARCHAR(255),
  address VARCHAR(255),
  department VARCHAR(100),
  zone VARCHAR(100),
  skills VARCHAR(255),
  vehicle_number VARCHAR(30),
  experience_years NUMERIC(4,1) DEFAULT 0,
  current_status VARCHAR(20) NOT NULL DEFAULT 'offline' CHECK (current_status IN ('available', 'busy', 'offline')),
  current_latitude NUMERIC(10,7),
  current_longitude NUMERIC(10,7),
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  is_on_leave BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_exec_zone ON executives (zone);
CREATE INDEX idx_exec_status ON executives (current_status, is_on_leave);

-- ---------------------------------------------------------------------
-- Complaints
-- ---------------------------------------------------------------------
CREATE TABLE complaints (
  id SERIAL PRIMARY KEY,
  complaint_number VARCHAR(30) NOT NULL UNIQUE,
  vendor_id INT NOT NULL REFERENCES vendors(id),
  vendor_user_id INT NOT NULL REFERENCES vendor_users(id),
  category VARCHAR(100) NOT NULL,
  complaint_type VARCHAR(100),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical', 'emergency')),
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(255),
  landmark VARCHAR(150),
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  assigned_executive_id INT REFERENCES executives(id) ON DELETE SET NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (status IN (
    'open', 'assigned', 'accepted', 'rejected', 'started', 'reached_site',
    'in_progress', 'waiting_for_parts', 'completed', 'closed', 'cancelled'
  )),
  remarks TEXT,
  expected_completion_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_complaint_status ON complaints (status);
CREATE INDEX idx_complaint_vendor ON complaints (vendor_id);
CREATE INDEX idx_complaint_executive ON complaints (assigned_executive_id);
CREATE INDEX idx_complaint_priority ON complaints (priority);
CREATE INDEX idx_complaint_created ON complaints (created_at);

CREATE TABLE complaint_history (
  id SERIAL PRIMARY KEY,
  complaint_id INT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  actor_user_id INT NOT NULL REFERENCES users(id),
  from_status VARCHAR(30),
  to_status VARCHAR(30) NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_ch_complaint ON complaint_history (complaint_id);

CREATE TABLE complaint_images (
  id SERIAL PRIMARY KEY,
  complaint_id INT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  file_path VARCHAR(255) NOT NULL,
  uploaded_by_role VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE complaint_files (
  id SERIAL PRIMARY KEY,
  complaint_id INT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  file_path VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size_bytes INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Live tracking
-- ---------------------------------------------------------------------
CREATE TABLE executive_locations (
  id BIGSERIAL PRIMARY KEY,
  executive_id INT NOT NULL REFERENCES executives(id) ON DELETE CASCADE,
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_loc_exec_time ON executive_locations (executive_id, recorded_at);

-- ---------------------------------------------------------------------
-- Leave
-- ---------------------------------------------------------------------
CREATE TABLE leave_requests (
  id SERIAL PRIMARY KEY,
  executive_id INT NOT NULL REFERENCES executives(id) ON DELETE CASCADE,
  leave_from DATE NOT NULL,
  leave_to DATE NOT NULL,
  leave_type VARCHAR(50),
  reason TEXT,
  approval_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  remarks TEXT,
  approved_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_leave_exec_dates ON leave_requests (executive_id, leave_from, leave_to);

-- ---------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  event_type VARCHAR(50),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notif_user_read ON notifications (user_id, is_read);

-- ---------------------------------------------------------------------
-- Audit / activity
-- ---------------------------------------------------------------------
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  ip_address VARCHAR(45),
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_module ON audit_logs (module);
CREATE INDEX idx_audit_created ON audit_logs (created_at);

CREATE TABLE activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  activity VARCHAR(150) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Auth support
-- ---------------------------------------------------------------------
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_rt_user ON refresh_tokens (user_id);

CREATE TABLE password_resets (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  "key" VARCHAR(100) NOT NULL UNIQUE,
  value VARCHAR(500),
  description VARCHAR(255)
);

-- =====================================================================
-- updated_at auto-touch triggers
-- Postgres has no "ON UPDATE CURRENT_TIMESTAMP" column clause like MySQL —
-- a trigger is the standard equivalent, applied to every table that has an
-- updated_at column (vendors, users, complaints).
-- =====================================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- =====================================================================
-- Audit trigger: log every complaint status change into audit_logs as a
-- system-wide safety net, in addition to the dedicated complaint_history
-- table (written explicitly by the service layer, since it needs the
-- actor's user_id which a DB trigger can't know).
-- =====================================================================
CREATE OR REPLACE FUNCTION fn_complaint_status_audit() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status <> NEW.status THEN
    INSERT INTO audit_logs (user_id, module, action, old_value, new_value)
    VALUES (
      NULL,
      'complaints',
      'status_change',
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_complaint_status_audit
  AFTER UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION fn_complaint_status_audit();

-- =====================================================================
-- Function: assign a complaint, guarded against assigning to an executive
-- currently on leave (defense-in-depth; the service layer also checks this
-- before calling). Not currently invoked from application code — kept as
-- a DB-layer safety net for anyone querying/writing directly.
-- Call with: SELECT sp_assign_complaint(complaint_id, executive_id, actor_user_id);
-- =====================================================================
CREATE OR REPLACE FUNCTION sp_assign_complaint(
  p_complaint_id INT,
  p_executive_id INT,
  p_actor_user_id INT
) RETURNS VOID AS $$
DECLARE
  v_on_leave BOOLEAN;
BEGIN
  SELECT is_on_leave INTO v_on_leave FROM executives WHERE id = p_executive_id;

  IF v_on_leave THEN
    RAISE EXCEPTION 'Cannot assign complaint: executive is currently on leave';
  ELSE
    UPDATE complaints
      SET assigned_executive_id = p_executive_id, status = 'assigned'
      WHERE id = p_complaint_id;

    INSERT INTO complaint_history (complaint_id, actor_user_id, from_status, to_status, remarks)
      VALUES (p_complaint_id, p_actor_user_id, 'open', 'assigned', 'Assigned via sp_assign_complaint');
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- Views for reporting
-- =====================================================================
CREATE OR REPLACE VIEW vw_complaint_status_counts AS
SELECT status, COUNT(*) AS total
FROM complaints
GROUP BY status;

CREATE OR REPLACE VIEW vw_vendor_wise_complaints AS
SELECT v.id AS vendor_id, v.vendor_name, COUNT(c.id) AS total_complaints,
       COUNT(*) FILTER (WHERE c.status = 'open') AS open_count,
       COUNT(*) FILTER (WHERE c.status = 'closed') AS closed_count
FROM vendors v
LEFT JOIN complaints c ON c.vendor_id = v.id
GROUP BY v.id, v.vendor_name;

CREATE OR REPLACE VIEW vw_executive_performance AS
SELECT e.id AS executive_id, u.name AS executive_name,
       COUNT(c.id) AS total_assigned,
       COUNT(*) FILTER (WHERE c.status IN ('completed', 'closed')) AS total_completed,
       ROUND(CAST(AVG(EXTRACT(EPOCH FROM (c.updated_at - c.created_at)) / 3600) AS NUMERIC), 2) AS avg_resolution_hours
FROM executives e
JOIN users u ON u.id = e.user_id
LEFT JOIN complaints c ON c.assigned_executive_id = e.id
GROUP BY e.id, u.name;

CREATE OR REPLACE VIEW vw_category_wise_complaints AS
SELECT category, COUNT(*) AS total
FROM complaints
GROUP BY category;

CREATE OR REPLACE VIEW vw_priority_wise_complaints AS
SELECT priority, COUNT(*) AS total
FROM complaints
GROUP BY priority;

CREATE OR REPLACE VIEW vw_monthly_complaint_trend AS
SELECT TO_CHAR(created_at, 'YYYY-MM') AS month, COUNT(*) AS total
FROM complaints
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY month;
