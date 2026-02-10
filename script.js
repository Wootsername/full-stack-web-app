/* ============================================
    CLIENT-SIDE ROUTING
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
}


/* ============================================
    THE ROUTING FUNCTION (THE BRAIN!)
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
       
       Some pages require admin privileges.
       Regular users can't access them.
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
   ===========================================
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