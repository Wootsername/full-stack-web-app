/* ============================================
   PHASE 2: CLIENT-SIDE ROUTING
   ============================================
*/


/* ============================================
    GLOBAL VARIABLE
   ============================================
*/

let currentUser = null;


/* ============================================
    NAVIGATE FUNCTION
   ============================================
*/

function navigateTo(hash) {
    window.location.hash = hash;
    // When the hash changes, handleRouting() will run automatically
}


/* ============================================
    THE ROUTING FUNCTION
   ============================================
*/

function handleRouting() {
    let hash = window.location.hash || '#/';
    
    console.log('Current hash:', hash); // For debugging
    
    let pageName = hash.substring(2) || 'home';
    
    console.log('Page name:', pageName); // For debugging
    
    
    /* ========================================
        PROTECTED ROUTES
       ========================================
    */
    
    const protectedRoutes = ['profile', 'requests'];
    
    if (protectedRoutes.includes(pageName) && !currentUser) {
        console.log('Access denied: Not logged in');
        navigateTo('#/login');
        return; // Stop here
    }
    
    
    /* ========================================
        ADMIN-ONLY ROUTES
       ========================================
    */
    
    const adminRoutes = ['employees', 'accounts', 'departments'];
    
    if (adminRoutes.includes(pageName)) {
        // Check if user is logged in
        if (!currentUser) {
            console.log('Access denied: Not logged in');
            navigateTo('#/login');
            return;
        }
        
        // Check if user is admin
        if (currentUser.role !== 'admin') {
            console.log('Access denied: Not admin');
            alert('Access denied. Admin privileges required.');
            navigateTo('#/');
            return;
        }
    }
    
    
    /* ========================================
        SHOW THE CORRECT PAGE
       ========================================
    */
    
    // Hide all pages first
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Find the page we want to show
    const targetPage = document.getElementById(`${pageName}-page`);
    
    if (targetPage) {
        // Show the page
        targetPage.classList.add('active');
        console.log('Showing page:', pageName);
        
        // Call specific render functions for certain pages
        if (pageName === 'profile') {
            renderProfile();
        }
        if (pageName === 'accounts') {
            renderAccountsList();
        }
        if (pageName === 'departments') {
            renderDepartmentsList();
        }
        if (pageName === 'employees') {
            renderEmployeesList();
        }
    } else {
        // Page doesn't exist, go to home
        console.log('Page not found:', pageName);
        navigateTo('#/');
    }
}


/* ============================================
    LISTEN FOR HASH CHANGES
   ============================================
*/

window.addEventListener('hashchange', handleRouting);


/* ============================================
    INITIALIZATION
   ============================================
*/

document.addEventListener('DOMContentLoaded', () => {
    console.log('App initialized!');
    
    // If there's no hash in the URL, set it to home
    if (!window.location.hash) {
        window.location.hash = '#/';
    }
    
    // Show the correct page
    handleRouting();
});


/* ============================================
    AUTHENTICATION SYSTEM
   ============================================
*/


/* ============================================
    REGISTRATION
   ============================================
*/

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('#register-page form');
    
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stop the form from refreshing the page
            
            console.log('Register form submitted!');
            
            // Get the values from the form
            const firstName = document.getElementById('first-name').value.trim();
            const lastName = document.getElementById('last-name').value.trim();
            const email = document.getElementById('email').value.trim().toLowerCase();
            const password = document.getElementById('password').value;
            
            console.log('Registration attempt:', email);
            
            // Check if email already exists
            const existingAccount = window.db.accounts.find(acc => acc.email === email);
            
            if (existingAccount) {
                alert('Email already registered!');
                return; // Stop here
            }
            
            // Create new account object
            const newAccount = {
                id: Date.now(), // Simple ID using timestamp
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                role: 'user', // New users are regular users (not admin)
                verified: false, // Not verified yet!
                createdAt: new Date().toISOString()
            };
            
            // Add to database
            window.db.accounts.push(newAccount);
            saveToStorage(); // Save to localStorage
            
            console.log('Account created:', newAccount);
            
            // Store email for verification
            localStorage.setItem('unverified_email', email);
            
            // Navigate to verify email page
            navigateTo('#/verify-email');
            
            // Show the email on the verify page
            const emailDisplay = document.getElementById('verify-email-display');
            if (emailDisplay) {
                emailDisplay.textContent = email;
            }
            
            alert('Registration successful! Please verify your email.');
            registerForm.reset(); // Clear the form
        });
    }
});


/* ============================================
    EMAIL VERIFICATION (SIMULATED)
   ============================================
*/

document.addEventListener('DOMContentLoaded', () => {
    const verifyBtn = document.querySelector('#verify-email-page button.btn-success');
    
    if (verifyBtn) {
        verifyBtn.addEventListener('click', () => {
            console.log('Verify button clicked!');
            
            // Get the email we're trying to verify
            const unverifiedEmail = localStorage.getItem('unverified_email');
            
            if (!unverifiedEmail) {
                alert('No pending verification found.');
                return;
            }
            
            console.log('Verifying email:', unverifiedEmail);
            
            // Find the account
            const account = window.db.accounts.find(acc => acc.email === unverifiedEmail);
            
            if (account) {
                // Mark as verified!
                account.verified = true;
                saveToStorage(); // Save to localStorage
                
                // Clear the unverified email
                localStorage.removeItem('unverified_email');
                
                console.log('Email verified!', account);
                alert('Email verified successfully! You can now login.');
                
                // Go to login page
                navigateTo('#/login');
            } else {
                alert('Account not found.');
            }
        });
    }
});


/* ============================================
    LOGIN
   ============================================
*/

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('#login-page form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stop form from refreshing page
            
            console.log('Login form submitted!');
            
            // Get values
            const email = document.getElementById('login-email').value.trim().toLowerCase();
            const password = document.getElementById('login-password').value;
            
            console.log('Login attempt:', email);
            
            // Find matching account
            const account = window.db.accounts.find(acc => 
                acc.email === email && 
                acc.password === password && 
                acc.verified === true
            );
            
            if (account) {
                console.log('Login successful!', account);
                
                // Save auth token
                localStorage.setItem('auth_token', email);
                
                // Update auth state
                setAuthState(true, account);
                
                // Go to profile
                navigateTo('#/profile');
                
                alert(`Welcome back, ${account.firstName}!`);
                loginForm.reset();
            } else {
                console.log('Login failed');
                alert('Invalid email or password, or email not verified.');
            }
        });
    }
});


/* ============================================
    AUTH STATE MANAGEMENT
   ============================================
*/

function setAuthState(isAuth, user = null) {
    const body = document.body;
    
    console.log('Setting auth state:', isAuth, user);
    
    if (isAuth && user) {
        // User is logged in!
        currentUser = user;
        
        // Change body classes
        body.classList.remove('not-authenticated');
        body.classList.add('authenticated');
        
        // Update username display in navbar
        const usernameDisplay = document.querySelector('.navbar-nav .dropdown-toggle');
        if (usernameDisplay) {
            usernameDisplay.textContent = `${user.firstName} ${user.lastName}`;
        }
        
        // Check if admin
        if (user.role === 'admin') {
            body.classList.add('is-admin');
            console.log('Admin user logged in');
        } else {
            body.classList.remove('is-admin');
            console.log('Regular user logged in');
        }
    } else {
        // User is logged out
        currentUser = null;
        
        // Change body classes
        body.classList.remove('authenticated', 'is-admin');
        body.classList.add('not-authenticated');
        
        console.log('User logged out');
    }
}


/* ============================================
    LOGOUT
   ============================================
*/

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            console.log('Logout clicked');
            
            // Clear auth token
            localStorage.removeItem('auth_token');
            
            // Reset auth state
            setAuthState(false);
            
            // Go to home
            navigateTo('#/');
            
            alert('Logged out successfully.');
        });
    }
});


/* ============================================
    DATA PERSISTENCE WITH LOCALSTORAGE
   ============================================
*/

// Storage key constant
const STORAGE_KEY = 'ipt_demo_v1';

// Initialize the database
window.db = {
    accounts: [],
    departments: [],
    employees: [],
    requests: []
};


/* ============================================
   LOAD FROM STORAGE
   ============================================
*/

function loadFromStorage() {
    try {
        console.log('Loading data from localStorage...');
        
        // Try to get stored data
        const stored = localStorage.getItem(STORAGE_KEY);
        
        if (stored) {
            // Parse the JSON string back into an object
            window.db = JSON.parse(stored);
            console.log('✅ Data loaded successfully:', window.db);
        } else {
            // No stored data, create initial seed data
            console.log('⚠️ No stored data found. Creating seed data...');
            seedDatabase();
        }
    } catch (error) {
        // If JSON is corrupt or other error, create seed data
        console.error('❌ Error loading data:', error);
        console.log('Creating fresh seed data...');
        seedDatabase();
    }
}


/* ============================================
   SEED DATABASE
   ============================================
*/

function seedDatabase() {
    window.db = {
        accounts: [
            {
                id: 1,
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@example.com',
                password: 'Password123!',
                role: 'admin',
                verified: true,
                createdAt: new Date().toISOString()
            }
        ],
        departments: [
            {
                id: 1,
                name: 'Engineering',
                description: 'Software development and technical operations'
            },
            {
                id: 2,
                name: 'HR',
                description: 'Human resources and personnel management'
            }
        ],
        employees: [],
        requests: []
    };
    
    console.log('✅ Seed data created:', window.db);
    
    // Save the seed data
    saveToStorage();
}


/* ============================================
   SAVE TO STORAGE
   ============================================
*/

function saveToStorage() {
    try {
        // Convert JavaScript object to JSON string
        const jsonString = JSON.stringify(window.db);
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, jsonString);
        
        console.log('💾 Data saved to localStorage');
    } catch (error) {
        console.error('❌ Error saving data:', error);
        alert('Failed to save data!');
    }
}


/* ============================================
   INITIALIZE ON PAGE LOAD
   ============================================
*/

// Load data immediately when script loads
loadFromStorage();


/* ============================================
    PROFILE PAGE
   ============================================
*/

function renderProfile() {
    console.log('Rendering profile page...');
    
    // Make sure user is logged in
    if (!currentUser) {
        console.log('No user logged in!');
        return;
    }
    
    console.log('Current user:', currentUser);
    
    // Get the profile content container
    const profileContent = document.getElementById('profile-content');
    
    if (!profileContent) {
        console.error('Profile content container not found!');
        return;
    }
    
    // Create the HTML to display
    profileContent.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${currentUser.firstName} ${currentUser.lastName}</h5>
                <p class="card-text">
                    <strong>Email:</strong> ${currentUser.email}<br>
                    <strong>Role:</strong> <span class="badge bg-${currentUser.role === 'admin' ? 'danger' : 'primary'}">${currentUser.role}</span><br>
                    <strong>Account Status:</strong> <span class="badge bg-success">Verified ✓</span>
                </p>
                <button class="btn btn-primary" onclick="editProfile()">Edit Profile</button>
            </div>
        </div>
    `;
    
    console.log('✅ Profile rendered');
}


/* ============================================
   EDIT PROFILE FUNCTION
   ============================================
*/

function editProfile() {
    alert('Edit profile feature coming soon!');
}


/* ============================================
    ADMIN CRUD FEATURES
   ============================================
*/


/* ============================================
    ACCOUNTS MANAGEMENT
   ============================================ */

function renderAccountsList() {
    console.log('Rendering accounts list...');
    
    const accountsContent = document.getElementById('accounts-content');
    if (!accountsContent) return;
    
    // Build the table HTML
    let tableHTML = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Verified</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Add a row for each account
    window.db.accounts.forEach(account => {
        tableHTML += `
            <tr>
                <td>${account.firstName} ${account.lastName}</td>
                <td>${account.email}</td>
                <td><span class="badge bg-${account.role === 'admin' ? 'danger' : 'primary'}">${account.role}</span></td>
                <td>${account.verified ? '✅' : '❌'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editAccount(${account.id})">Edit</button>
                    <button class="btn btn-sm btn-outline-warning ms-1" onclick="resetPassword(${account.id})">Reset Password</button>
                    <button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteAccount(${account.id})">Delete</button>
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    accountsContent.innerHTML = tableHTML;
    console.log('✅ Accounts table rendered');
}


/* ============================================
   EDIT ACCOUNT FUNCTION
   ============================================ */

function editAccount(accountId) {
    console.log('Editing account:', accountId);
    
    // Find the account
    const account = window.db.accounts.find(acc => acc.id === accountId);
    if (!account) {
        alert('Account not found!');
        return;
    }
    
    // For now, use simple prompts (you can make this a modal later!)
    const firstName = prompt('First Name:', account.firstName);
    if (!firstName) return; // User cancelled
    
    const lastName = prompt('Last Name:', account.lastName);
    if (!lastName) return;
    
    const email = prompt('Email:', account.email);
    if (!email) return;
    
    const role = prompt('Role (user/admin):', account.role);
    if (!role || (role !== 'user' && role !== 'admin')) {
        alert('Invalid role! Must be "user" or "admin"');
        return;
    }
    
    const verified = confirm('Is this account verified?');
    
    // Update the account
    account.firstName = firstName;
    account.lastName = lastName;
    account.email = email.toLowerCase();
    account.role = role;
    account.verified = verified;
    
    // Save to storage
    saveToStorage();
    
    // Re-render the table
    renderAccountsList();
    
    alert('Account updated successfully!');
}


/* ============================================
   RESET PASSWORD FUNCTION
   ============================================ */

function resetPassword(accountId) {
    console.log('Resetting password for account:', accountId);
    
    // Find the account
    const account = window.db.accounts.find(acc => acc.id === accountId);
    if (!account) {
        alert('Account not found!');
        return;
    }
    
    // Prompt for new password
    const newPassword = prompt(`Reset password for ${account.email}\n\nEnter new password (min 6 characters):`);
    
    if (!newPassword) return; // User cancelled
    
    // Validate password length
    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters!');
        return;
    }
    
    // Update password
    account.password = newPassword;
    
    // Save to storage
    saveToStorage();
    
    alert('Password reset successfully!');
}


/* ============================================
   DELETE ACCOUNT FUNCTION
   ============================================ */

function deleteAccount(accountId) {
    console.log('Deleting account:', accountId);
    
    // Prevent self-deletion
    if (currentUser && currentUser.id === accountId) {
        alert('You cannot delete your own account!');
        return;
    }
    
    // Find the account
    const account = window.db.accounts.find(acc => acc.id === accountId);
    if (!account) {
        alert('Account not found!');
        return;
    }
    
    // Confirm deletion
    const confirmed = confirm(`Are you sure you want to delete the account for ${account.email}?\n\nThis action cannot be undone!`);
    
    if (!confirmed) return;
    
    // Remove from array
    window.db.accounts = window.db.accounts.filter(acc => acc.id !== accountId);
    
    // Save to storage
    saveToStorage();
    
    // Re-render the table
    renderAccountsList();
    
    alert('Account deleted successfully!');
}


/* ============================================
    DEPARTMENTS MANAGEMENT
   ============================================ */

function renderDepartmentsList() {
    console.log('Rendering departments list...');
    
    const deptsContent = document.getElementById('departments-content');
    if (!deptsContent) return;
    
    // Build the table HTML
    let tableHTML = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Check if there are departments
    if (window.db.departments.length === 0) {
        tableHTML += `
            <tr>
                <td colspan="3" class="text-center text-muted">No departments found.</td>
            </tr>
        `;
    } else {
        // Add a row for each department
        window.db.departments.forEach(dept => {
            tableHTML += `
                <tr>
                    <td>${dept.name}</td>
                    <td>${dept.description}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="editDepartment(${dept.id})">Edit</button>
                        <button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteDepartment(${dept.id})">Delete</button>
                    </td>
                </tr>
            `;
        });
    }
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    deptsContent.innerHTML = tableHTML;
    console.log('✅ Departments table rendered');
}


/* ============================================
   ADD DEPARTMENT BUTTON
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const addDeptBtn = document.getElementById('add-department-btn');
    
    if (addDeptBtn) {
        addDeptBtn.addEventListener('click', () => {
            alert('Add department feature not implemented yet!');
        });
    }
});


/* ============================================
   EDIT DEPARTMENT FUNCTION
   ============================================ */

function editDepartment(deptId) {
    console.log('Editing department:', deptId);
    
    const dept = window.db.departments.find(d => d.id === deptId);
    if (!dept) {
        alert('Department not found!');
        return;
    }
    
    const name = prompt('Department Name:', dept.name);
    if (!name) return;
    
    const description = prompt('Description:', dept.description);
    if (!description) return;
    
    dept.name = name;
    dept.description = description;
    
    saveToStorage();
    renderDepartmentsList();
    
    alert('Department updated successfully!');
}


/* ============================================
   DELETE DEPARTMENT FUNCTION
   ============================================ */

function deleteDepartment(deptId) {
    console.log('Deleting department:', deptId);
    
    const dept = window.db.departments.find(d => d.id === deptId);
    if (!dept) {
        alert('Department not found!');
        return;
    }
    
    const confirmed = confirm(`Delete department "${dept.name}"?\n\nThis action cannot be undone!`);
    if (!confirmed) return;
    
    window.db.departments = window.db.departments.filter(d => d.id !== deptId);
    
    saveToStorage();
    renderDepartmentsList();
    
    alert('Department deleted successfully!');
}


/* ============================================
    EMPLOYEES MANAGEMENT
   ============================================ */

function renderEmployeesList() {
    console.log('Rendering employees list...');
    
    const employeesContent = document.getElementById('employees-content');
    if (!employeesContent) return;
    
    // Build the table HTML
    let tableHTML = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Position</th>
                    <th>Dept</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Check if there are employees
    if (window.db.employees.length === 0) {
        tableHTML += `
            <tr>
                <td colspan="5" class="text-center text-muted">No employees found.</td>
            </tr>
        `;
    } else {
        // Add a row for each employee
        window.db.employees.forEach(employee => {
            // Find the user account
            const user = window.db.accounts.find(acc => acc.id === employee.userId);
            const userEmail = user ? user.email : 'Unknown';
            
            // Find the department
            const dept = window.db.departments.find(d => d.id === employee.departmentId);
            const deptName = dept ? dept.name : 'Unknown';
            
            tableHTML += `
                <tr>
                    <td>${employee.employeeId}</td>
                    <td>${userEmail}</td>
                    <td>${employee.position}</td>
                    <td>${deptName}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="editEmployee(${employee.id})">Edit</button>
                        <button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteEmployee(${employee.id})">Delete</button>
                    </td>
                </tr>
            `;
        });
    }
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    employeesContent.innerHTML = tableHTML;
    console.log('✅ Employees table rendered');
}


/* ============================================
   ADD EMPLOYEE BUTTON
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const addEmployeeBtn = document.getElementById('add-employee-btn');
    
    if (addEmployeeBtn) {
        addEmployeeBtn.addEventListener('click', () => {
            console.log('Add employee clicked');
            
            // Employee ID
            const employeeId = prompt('Employee ID:');
            if (!employeeId) return;
            
            // User Email
            const userEmail = prompt('User Email (must match existing account):');
            if (!userEmail) return;
            
            // Find the user account
            const user = window.db.accounts.find(acc => acc.email === userEmail.toLowerCase());
            if (!user) {
                alert('No account found with that email! Please create the account first.');
                return;
            }
            
            // Position
            const position = prompt('Position:');
            if (!position) return;
            
            // Show available departments
            const deptList = window.db.departments.map(d => `${d.id}: ${d.name}`).join('\n');
            const deptId = prompt(`Department ID:\n\n${deptList}\n\nEnter department ID:`);
            if (!deptId) return;
            
            // Validate department exists
            const dept = window.db.departments.find(d => d.id === parseInt(deptId));
            if (!dept) {
                alert('Invalid department ID!');
                return;
            }
            
            // Hire Date
            const hireDate = prompt('Hire Date (YYYY-MM-DD):');
            if (!hireDate) return;
            
            // Create new employee
            const newEmployee = {
                id: Date.now(),
                employeeId: employeeId,
                userId: user.id,
                position: position,
                departmentId: parseInt(deptId),
                hireDate: hireDate
            };
            
            window.db.employees.push(newEmployee);
            saveToStorage();
            renderEmployeesList();
            
            alert('Employee added successfully!');
        });
    }
});


/* ============================================
   EDIT EMPLOYEE FUNCTION
   ============================================ */

function editEmployee(id) {
    console.log('Editing employee:', id);
    
    const employee = window.db.employees.find(e => e.id === id);
    if (!employee) {
        alert('Employee not found!');
        return;
    }
    
    // Employee ID
    const employeeId = prompt('Employee ID:', employee.employeeId);
    if (!employeeId) return;
    
    // Position
    const position = prompt('Position:', employee.position);
    if (!position) return;
    
    // Department
    const deptList = window.db.departments.map(d => `${d.id}: ${d.name}`).join('\n');
    const deptId = prompt(`Department ID:\n\n${deptList}\n\nEnter department ID:`, employee.departmentId);
    if (!deptId) return;
    
    // Hire Date
    const hireDate = prompt('Hire Date (YYYY-MM-DD):', employee.hireDate);
    if (!hireDate) return;
    
    // Update employee
    employee.employeeId = employeeId;
    employee.position = position;
    employee.departmentId = parseInt(deptId);
    employee.hireDate = hireDate;
    
    saveToStorage();
    renderEmployeesList();
    
    alert('Employee updated successfully!');
}


/* ============================================
   DELETE EMPLOYEE FUNCTION
   ============================================ */

function deleteEmployee(id) {
    console.log('Deleting employee:', id);
    
    const employee = window.db.employees.find(e => e.id === id);
    if (!employee) {
        alert('Employee not found!');
        return;
    }
    
    const confirmed = confirm(`Delete employee ${employee.employeeId}?\n\nThis action cannot be undone!`);
    if (!confirmed) return;
    
    window.db.employees = window.db.employees.filter(e => e.id !== id);
    
    saveToStorage();
    renderEmployeesList();
    
    alert('Employee deleted successfully!');
}

// Check for existing auth on page load
document.addEventListener('DOMContentLoaded', () => {
    const authToken = localStorage.getItem('auth_token');
    
    if (authToken) {
        console.log('Found existing auth token:', authToken);
        
        // Find the user
        const user = window.db.accounts.find(acc => acc.email === authToken);
        
        if (user && user.verified) {
            console.log('Auto-login:', user);
            setAuthState(true, user);
        } else {
            console.log('Invalid token, clearing...');
            localStorage.removeItem('auth_token');
        }
    }
});