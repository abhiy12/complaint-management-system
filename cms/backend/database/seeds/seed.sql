-- Roles
INSERT INTO roles (name, description) VALUES
 ('super_admin', 'Full system access'),
 ('vendor_admin', 'Manages vendor users and complaints for their vendor'),
 ('vendor_sub_user', 'Creates and tracks own complaints'),
 ('executive', 'Field executive who resolves complaints');

-- Permissions (representative set; extend as needed)
INSERT INTO permissions (code, description) VALUES
 ('vendor:create', 'Create vendors'),
 ('vendor:read', 'View vendors'),
 ('vendor:update', 'Update vendors'),
 ('vendor:delete', 'Delete vendors'),
 ('executive:create', 'Create executives'),
 ('executive:read', 'View executives'),
 ('executive:update', 'Update executives'),
 ('executive:delete', 'Delete executives'),
 ('complaint:create', 'Create complaints'),
 ('complaint:read', 'View complaints'),
 ('complaint:assign', 'Assign/reassign complaints'),
 ('complaint:update_status', 'Update complaint status'),
 ('report:view', 'View reports'),
 ('report:export', 'Export reports');

-- super_admin gets everything
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'super_admin';

-- vendor_admin permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'vendor_admin'
  AND p.code IN ('complaint:create','complaint:read','report:view');

-- vendor_sub_user permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'vendor_sub_user'
  AND p.code IN ('complaint:create','complaint:read');

-- executive permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'executive'
  AND p.code IN ('complaint:read','complaint:update_status');

-- Default settings
INSERT INTO settings ("key", value, description) VALUES
 ('location_ping_interval_seconds', '30', 'How often executives report location'),
 ('location_history_retention_days', '90', 'Days to retain raw location pings'),
 ('max_upload_size_mb', '10', 'Max file upload size'),
 ('company_name', 'Complaint Management System', 'Displayed in UI/emails');

-- Initial Super Admin
-- Password: Admin@12345  (bcrypt hash below, verified with bcrypt.hashSync('Admin@12345', 12) — change immediately in production)
INSERT INTO users (name, email, phone, password_hash, role_id, status)
SELECT 'Super Admin', 'admin@example.com', '9999999999',
       '$2b$12$JGpJZZPA891d0BwMRlVGd.mw98VIbSLCnXzEtEJyLc3q66YB9k8gC',
       r.id, 'active'
FROM roles r WHERE r.name = 'super_admin';
