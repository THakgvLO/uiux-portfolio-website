function adjustGrid() {
    const grid = document.getElementById('hexGrid');
    const items = document.querySelectorAll('.hex-item');
    const count = items.length;

    // Logic: If we have many items, reduce the width to prevent overflow
    if (count > 6) {
        items.forEach(item => {
            item.style.width = '180px';
            item.style.margin = '5px';
        });
    }
}

window.addEventListener('load', adjustGrid);
window.addEventListener('resize', adjustGrid);

/**
 * toggleProjectView: 
 * Switches between individual screen embeds and the full prototype.
 * Updates the button text to show the "next available" state.
 */
function toggleProjectView() {
    const btn = document.getElementById('viewToggleButton');
    const staticView = document.getElementById('staticScreens');
    const protoView = document.getElementById('livePrototype');

    // Check if prototype is currently hidden
    if (protoView.style.display === 'none') {
        // ACTION: SHOW PROTOTYPE
        staticView.style.display = 'none';
        protoView.style.display = 'block';
        
        // Update button text to the alternative option
        btn.innerText = "Switch to Individual Screens";
    } else {
        // ACTION: SHOW INDIVIDUAL SCREENS
        staticView.style.display = 'grid'; // Returns to grid layout
        protoView.style.display = 'none';
        
        // Update button text to the alternative option
        btn.innerText = "Switch to Full Prototype";
    }
}

// Reset project grid scroll to start on load
window.addEventListener('load', () => {
    const squareGrid = document.querySelector('.square-grid');
    if (squareGrid) {
        setTimeout(() => {
            squareGrid.scrollLeft = 0;
        }, 100);
    }
});

// Hamburger menu toggle
window.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links li a');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Close menu when a link is clicked
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }
});