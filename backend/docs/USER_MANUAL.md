# TruFit Auto Center - User Manual

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Appointments](#appointments)
4. [Customers](#customers)
5. [Services](#services)
6. [Sales](#sales)
7. [Purchasing](#purchasing)
8. [Products & Inventory](#products--inventory)
9. [Reports](#reports)
10. [Employee Management](#employee-management)
11. [Roles & Permissions](#roles--permissions)
12. [Account Settings](#account-settings)

---

## Getting Started

### Login
1. Navigate to the login page at `/webapp/login`
2. Enter your username and password
3. Click "Sign In"
4. If prompted, complete the verification challenge

### Navigation
- The **sidebar** on the left provides access to all modules
- Menu items are filtered based on your role permissions
- Click a parent menu item to expand its sub-items
- The sidebar can be collapsed using the toggle button in the header

---

## Dashboard

The dashboard provides an overview of your business metrics:
- **Revenue charts** showing daily/monthly trends
- **KPI cards** for key metrics (revenue, orders, outstanding invoices)
- **Top products** and **low stock alerts**
- Dashboard view varies based on your role (Admin, Sales, Purchasing, HR)

---

## Appointments

Manage customer appointments and scheduling.

### View Appointments
- Navigate to **Appointments** in the sidebar
- The calendar view shows all scheduled appointments
- Filter by date, status, or technician

### Create Appointment
1. Click **+ New Appointment**
2. Select customer (or create new)
3. Choose date and time
4. Select service type
5. Assign technician
6. Click **Save**

### Manage Appointment
- Click on an appointment to view details
- **Reschedule**: Change date/time
- **Cancel**: Mark as cancelled
- **Complete**: Mark as done after service

---

## Customers

Manage customer profiles and vehicle information.

### View Customers
- Navigate to **Customers** in the sidebar
- Search by name, email, or phone
- Filter by status

### Customer Profile
- **Personal Info**: Name, email, phone, address
- **Vehicles**: List of registered vehicles
- **History**: Past appointments, estimates, and invoices

### Add Customer
1. Click **+ Add Customer**
2. Fill in required fields (name, phone)
3. Add vehicle information
4. Click **Save**

---

## Services

### Job Orders
Track service tasks from estimate to completion.

**Status Flow**: `CREATED → APPROVED → IN_PROGRESS → COMPLETED`

1. **Create JO**: Generated from approved estimate or manually
2. **Assign Technician**: Select primary and assistant technicians
3. **Track Progress**: Update status as work progresses
4. **Complete**: Mark as done, triggers billing

### Service Catalog
Manage your service offerings and pricing.

- **Services**: List of available services with pricing
- **Task Library**: Individual tasks that make up services
- **Categories**: Organize services by category

---

## Sales

### Estimates
Create and manage service estimates for customers.

1. **New Estimate**: Select customer and vehicle
2. **Add Line Items**: Services and parts with quantities
3. **Calculate Total**: Auto-calculated with tax
4. **Submit**: Send for customer approval
5. **Convert**: Convert approved estimate to Sales Order

### Sales Orders
Track confirmed sales from estimate to completion.

**Status Flow**: `PENDING → APPROVED → IN_PROGRESS → COMPLETED`

- **Issue**: Generate billing statement
- **Return**: Process returns if needed
- **PDF**: Download sales order document

### Billing
Manage invoices and payment collection.

1. **View Bills**: List of all billing statements
2. **Add Payment**: Record payment against a bill
3. **Payment Methods**: Cash, Card, Bank Transfer, GCash, Maya
4. **Print Receipt**: Generate payment receipt

---

## Purchasing

### Purchase Orders
Manage orders to suppliers.

1. **Create PO**: Select supplier and add items
2. **Submit**: Send to supplier
3. **Receive**: Record goods receipt
4. **Bill**: Process supplier invoice

### Suppliers
Manage supplier information and contacts.

### Goods Receipts
Record received goods against purchase orders.

### Supplier Bills
Track supplier invoices and payments.

### Stock Ledger
View all stock movements (receipts, sales, adjustments).

---

## Products & Inventory

### Product Catalog
Manage your product hierarchy:
- **Vehicles**: Car makes and models
- **Categories**: Product categories per vehicle
- **Products**: Individual parts and products

### Inventory
Track stock levels across the warehouse.

- **In Stock**: Products with sufficient quantity
- **Low Stock**: Products below reorder point
- **Out of Stock**: Products with zero availability

### Warehouse
Manage warehouse locations and bin assignments.

---

## Reports

### Sales Report
- Revenue summary for selected period
- Daily revenue chart
- Sales by type breakdown
- Top services by revenue

### Inventory Report
- Stock distribution (pie chart)
- Low stock alerts
- Inventory valuation
- Products by status

### Financial Report
- Revenue vs. collections
- Outstanding balances
- Collection rate
- Payments by method

---

## Employee Management

### Current Employees
- View all active employees
- Edit employee details
- Change role assignment
- Terminate (soft delete) employees

### Onboarding
Generate registration keys for new employees:

1. Click **+ Generate Key**
2. Select role for new employee
3. Copy the generated key
4. Share key with new employee for self-registration

---

## Roles & Permissions

Manage user access control (requires `system.manage_roles` permission).

### Permission Groups

| Group | Permissions |
|-------|-------------|
| **Appointments & Customers** | View/Manage Appointments, View/Manage Customers |
| **Sales & Services** | View/Manage Job Orders, Manage Service Catalog, View/Manage Sales |
| **Operations & Inventory** | View/Manage Products, View/Manage Purchasing |
| **System Administration** | Manage Employees, Employee Onboarding, Manage Roles & UAC |

### Default Roles

| Role | Access Level |
|------|-------------|
| **Admin** | Full system access |
| **Supervisor** | Most modules except role management |
| **Service Advisor** | Appointments, customers, job orders, sales |
| **Technician** | View appointments, customers, job orders, products |

### Create New Role
1. Click **+ Add Role**
2. Enter role name
3. Toggle permission checkboxes
4. Click **Save Configurations**

### Edit Role
1. Select role from the left panel
2. Modify name or permissions
3. Click **Save Configurations**

### Delete Role
1. Hover over the role in the left panel
2. Click the trash icon
3. Confirm deletion
- Note: Admin role cannot be deleted
- Note: Roles with assigned employees cannot be deleted

---

## Account Settings

### Profile
- Update your name and contact information
- Change password

### Preferences
- Notification settings
- Display preferences

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Quick search |
| `Esc` | Close modal/dialog |

---

## Troubleshooting

### Cannot access a page
- Check with your administrator for proper role assignment
- Your role may not have the required permission

### Data not loading
- Check your internet connection
- Try refreshing the page (F5)
- Clear browser cache if issue persists

### Session expired
- You will be redirected to login
- Re-enter your credentials to continue

---

*Last updated: July 2026*
*Version: 1.0.0*
