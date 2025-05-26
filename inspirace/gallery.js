document.addEventListener('DOMContentLoaded', () => {
    // References to DOM elements
    const filterContainer = document.querySelector('.filter-container');
    const galleryContainer = document.querySelector('.gallery-container');
    const galleryDockIcon = document.getElementById('gallery-dock-icon');
    const aboutDockIcon = document.getElementById('about-dock-icon');
    const startDockButton = document.getElementById('start-dock-button');
    
    // Variable to store the color highlight interval
    let colorHighlightInterval;
    // Variable to track currently highlighted image
    let currentHighlightedImage = null;
    // Store all available images by category
    let allImagesByCategory = {};
    // Store all images with unique IDs
    let allImagesById = {};
    // Track which image IDs are currently displayed
    let displayedImageIds = new Set();
    // Maximum number of images to display
    const MAX_IMAGES = 15;
    
    // Keep track of window wrappers
    const windowWrappers = {};
    
    // Create wrapper element
    const galleryWrapper = document.createElement('div');
    galleryWrapper.classList.add('gallery-wrapper', 'draggable');
    galleryWrapper.id = 'gallery-wrapper';
    
    // Add drag handle with window controls
    const galleryDragHandle = createDragHandle('Gallery');
    const galleryControls = createWindoowControls('gallery');
    galleryDragHandle.appendChild(galleryControls.controls);
    galleryWrapper.appendChild(galleryDragHandle);
    
    // Move containers into wrapper
    filterContainer.parentNode.insertBefore(galleryWrapper, filterContainer);
    galleryWrapper.appendChild(filterContainer);
    galleryWrapper.appendChild(galleryContainer);
    
    // Add specific listeners for gallery controls
    addWindowControlListeners(galleryWrapper, galleryControls.minimizeBtn, galleryControls.maximizeBtn, galleryControls.closeBtn, galleryDockIcon);
    
    // Make wrapper draggable
    initDraggable(galleryWrapper);
    windowWrappers['gallery'] = { wrapper: galleryWrapper, controls: galleryControls, dockIcon: galleryDockIcon };
    
    // Remove draggable from individual containers
    filterContainer.classList.remove('draggable');
    galleryContainer.classList.remove('draggable');

    // Filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filter === 'all' || item.classList.contains(filter)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Create About Us window
    const aboutWrapper = document.createElement('div');
    aboutWrapper.classList.add('about-wrapper', 'draggable');
    aboutWrapper.id = 'about-wrapper';
    
    // Add drag handle with window controls
    const aboutDragHandle = createDragHandle('About Us');
    const aboutControls = createWindoowControls('about');
    aboutDragHandle.appendChild(aboutControls.controls);
    aboutWrapper.appendChild(aboutDragHandle);
    
    // Create and add about content
    const aboutContent = document.createElement('div');
    aboutContent.classList.add('about-content');
    aboutContent.innerHTML = `
        <h2>About Us</h2>
        <div class="left-column">
            <h3>Our Mission</h3>
            <p>Placeholder text about the company's mission and values.</p>
            <div class="highlight-box">
                <p><strong>Key Focus:</strong> Innovative Design Solutions</p>
            </div>
            <a href="#" class="cta-button">Learn More</a>
        </div>
        <div class="right-column">
            <h3>Our Team</h3>
            <p>Placeholder text about the talented team behind the creations.</p>
            <div class="stat-grid">
                <div class="stat-item">
                    <div class="stat-number">10+</div>
                    <div class="stat-label">Years Experience</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">100+</div>
                    <div class="stat-label">Projects Completed</div>
                </div>
            </div>
            <h3>Features</h3>
            <ul class="feature-list">
                <li>Dynamic Content Loading</li>
                <li>Interactive Filtering</li>
                <li>Responsive Design</li>
                <li>Draggable Windows</li>
            </ul>
        </div>
    `;
    aboutWrapper.appendChild(aboutContent);
    
    // Append About window to body (or specific container if preferred)
    document.body.appendChild(aboutWrapper);
    
    // Add specific listeners for about controls
    addWindowControlListeners(aboutWrapper, aboutControls.minimizeBtn, aboutControls.maximizeBtn, aboutControls.closeBtn, aboutDockIcon);
    
    // Make About Us wrapper draggable
    initDraggable(aboutWrapper);
    windowWrappers['about'] = { wrapper: aboutWrapper, controls: aboutControls, dockIcon: aboutDockIcon };
    
    // Add Dock Icon Click Listeners
    galleryDockIcon.addEventListener('click', () => restoreWindowFromDock(galleryWrapper, galleryControls.closeBtn, galleryDockIcon));
    aboutDockIcon.addEventListener('click', () => restoreWindowFromDock(aboutWrapper, aboutControls.closeBtn, aboutDockIcon));

    // Add Start Button Listener
    startDockButton.addEventListener('click', () => {
        console.log("Start button clicked");
        // Close all open windows
        Object.values(windowWrappers).forEach(({ wrapper, controls, dockIcon }) => {
            if (!wrapper.classList.contains('closed')) {
                closeWindow(wrapper, controls.closeBtn, dockIcon, controls.maximizeBtn);
            }
        });
    });

    // --- Close Windows By Default --- 
    // Use setTimeout to ensure layout is stable before closing
    setTimeout(() => {
        console.log("Closing windows by default");
        Object.values(windowWrappers).forEach(({ wrapper, controls, dockIcon }) => {
            closeWindow(wrapper, controls.closeBtn, dockIcon, controls.maximizeBtn);
        });
    }, 50); // Small delay

    // --- Helper Functions ---

    // Function to create drag handle
    function createDragHandle(title) {
        const handle = document.createElement('div');
        handle.classList.add('drag-handle');
        handle.textContent = title; // Set title directly
        return handle;
    }

    // Function to create window controls
    function createWindoowControls(windowName) {
        const controls = document.createElement('div');
        controls.classList.add('window-controls');

        const minimizeBtn = document.createElement('button');
        minimizeBtn.classList.add('window-btn', 'minimize');
        minimizeBtn.setAttribute('title', 'Minimize');
        minimizeBtn.dataset.window = windowName;

        const maximizeBtn = document.createElement('button');
        maximizeBtn.classList.add('window-btn', 'maximize');
        maximizeBtn.setAttribute('title', 'Maximize');
        maximizeBtn.dataset.window = windowName;

        const closeBtn = document.createElement('button');
        closeBtn.classList.add('window-btn', 'close');
        closeBtn.setAttribute('title', 'Close');
        closeBtn.dataset.window = windowName;

        controls.appendChild(minimizeBtn);
        controls.appendChild(maximizeBtn);
        controls.appendChild(closeBtn);

        return { controls, minimizeBtn, maximizeBtn, closeBtn };
    }

    // Function to add listeners to window controls
    function addWindowControlListeners(wrapper, minimizeBtn, maximizeBtn, closeBtn, dockIcon) {
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (wrapper.classList.contains('closed')) return;
            wrapper.classList.toggle('minimized');
            if (wrapper.classList.contains('maximized')) {
                wrapper.classList.remove('maximized');
                maximizeBtn.classList.remove('restore');
                maximizeBtn.setAttribute('title', 'Maximize');
            }
        });

        maximizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (wrapper.classList.contains('closed')) return;
            const isMaximized = wrapper.classList.toggle('maximized');
            maximizeBtn.classList.toggle('restore', isMaximized);
             maximizeBtn.setAttribute('title', isMaximized ? 'Restore' : 'Maximize');
            if (wrapper.classList.contains('minimized')) {
                wrapper.classList.remove('minimized');
            }
        });

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isClosed = wrapper.classList.contains('closed');

            if (isClosed) {
                // Restore the window
                restoreWindow(wrapper, closeBtn, dockIcon);
            } else {
                // Close the window
                closeWindow(wrapper, closeBtn, dockIcon, maximizeBtn);
            }
        });

         // Double click on drag handle to maximize/restore or open if closed
         wrapper.querySelector('.drag-handle').addEventListener('dblclick', (e) => {
             if (e.target.classList.contains('drag-handle')) { // Ensure click is on handle itself
                 if (wrapper.classList.contains('closed')) {
                     restoreWindow(wrapper, closeBtn, dockIcon);
                     return;
                 }
                 // Don't maximize/restore if minimized
                 if (wrapper.classList.contains('minimized')) return;

                 const isMaximized = wrapper.classList.toggle('maximized');
                 maximizeBtn.classList.toggle('restore', isMaximized);
                 maximizeBtn.setAttribute('title', isMaximized ? 'Restore' : 'Maximize');
             }
         });
    }

    // Function to handle closing a window
    function closeWindow(wrapper, closeBtn, dockIcon, maximizeBtn) {
        wrapper.classList.add('closed');
        wrapper.classList.remove('minimized', 'maximized', 'dragging'); // Ensure other states removed
        if (maximizeBtn) { // Check if maximizeBtn exists
           maximizeBtn.classList.remove('restore'); // Ensure maximize button resets
           maximizeBtn.setAttribute('title', 'Maximize');
        }
        if (closeBtn) closeBtn.setAttribute('title', 'Restore');
        if (dockIcon) dockIcon.classList.add('visible'); // Show dock icon
        // Reset transform style if it was being dragged
        wrapper.style.transform = '';
        // Reset offsets if using the draggable logic below that stores them
        if (wrapper.dataset.xOffset) wrapper.dataset.xOffset = 0;
        if (wrapper.dataset.yOffset) wrapper.dataset.yOffset = 0;
    }

    // Function to handle restoring a window (from close button or dock)
    function restoreWindow(wrapper, closeBtn, dockIcon) {
        wrapper.classList.remove('closed');
        if (closeBtn) closeBtn.setAttribute('title', 'Close');
        if (dockIcon) dockIcon.classList.remove('visible'); // Hide dock icon
    }

     // Specific function for restoring from Dock click
     function restoreWindowFromDock(wrapper, closeBtn, dockIcon) {
        if (wrapper && wrapper.classList.contains('closed')) {
            restoreWindow(wrapper, closeBtn, dockIcon);
        }
    }

    // Make wrapper draggable (Revised initDraggable)
    function initDraggable(element) {
        let isDragging = false;
        let initialX, initialY;
        // Use data attributes to store offsets associated with the element
        element.dataset.xOffset = element.dataset.xOffset || 0;
        element.dataset.yOffset = element.dataset.yOffset || 0;

        const dragHandle = element.querySelector('.drag-handle');

        if (!dragHandle) {
            console.error("Draggable element needs a child with class 'drag-handle'");
            return;
        }

        dragHandle.addEventListener('mousedown', dragStart);
        // Attach move and up listeners to document for wider capture area
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        // Prevent dragging images inside the handle if any exist
        dragHandle.ondragstart = () => false;


        function dragStart(e) {
            // Prevent drag on buttons within the handle
            if (e.target.tagName === 'BUTTON') return;

            // Only start if not maximized or minimized or closed
            if (element.classList.contains('maximized') || element.classList.contains('minimized') || element.classList.contains('closed')) {
                isDragging = false;
                return;
            }

            isDragging = true;
            element.classList.add('dragging');

            // Calculate initial mouse position relative to the element's stored offset
            initialX = e.clientX - parseFloat(element.dataset.xOffset);
            initialY = e.clientY - parseFloat(element.dataset.yOffset);
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();

                // Calculate new offset
                const currentX = e.clientX - initialX;
                const currentY = e.clientY - initialY;

                // Store the new offset
                element.dataset.xOffset = currentX;
                element.dataset.yOffset = currentY;

                // Apply the transform
                setTranslate(currentX, currentY, element);
            }
        }

        function dragEnd() {
            if (isDragging) {
                 isDragging = false;
                 element.classList.remove('dragging');
                 // No need to update initialX/Y here as offsets are stored
            }
        }

        function setTranslate(xPos, yPos, el) {
            el.style.transform = `translate(${xPos}px, ${yPos}px)`;
        }

        // Set initial position based on stored offsets (e.g., if page reloads)
        // This might need more robust state saving logic (localStorage) for persistence
        // setTranslate(parseFloat(element.dataset.xOffset), parseFloat(element.dataset.yOffset), element);
    }

    // Define image categories and their images
    const imageCategories = {
        'obaly': [
            { src: 'images/obaly/obaly-1.jpg', filename: 'obaly-1.jpg' },
            { src: 'images/obaly/obaly-2.jpg', filename: 'obaly-2.jpg' },
            { src: 'images/obaly/Untitled.jpg', filename: 'Untitled.jpg' }
        ],
        'mirror-design': [
            { src: 'images/mirror-design/zrcadlo.jpg', filename: 'zrcadlo.jpg' },
            { src: 'images/mirror-design/mockup laptop 2@300x.png', filename: 'mockup laptop 2@300x.png' }
        ],
        'loga': [
            { src: 'images/loga/loga-1.jpg', filename: 'loga-1.jpg' },
            { src: 'images/loga/tulipi logo 200.png', filename: 'tulipi logo 200.png' },
            { src: 'images/loga/anime mirrors pruhledne.png', filename: 'anime mirrors pruhledne.png' },
            { src: 'images/loga/hg 2 (znamka).jpg', filename: 'hg 2 (znamka).jpg' }
        ],
        'vizualni-styl': [
            { src: 'images/vizualni-styl/vizualni-styl-1.jpg', filename: 'vizualni-styl-1.jpg' },
            { src: 'images/vizualni-styl/vizualni-styl-2.jpg', filename: 'vizualni-styl-2.jpg' },
            { src: 'images/vizualni-styl/vizualni-styl-3.jpg', filename: 'vizualni-styl-3.jpg' },
            { src: 'images/vizualni-styl/vizualni-styl-4.jpg', filename: 'vizualni-styl-4.jpg' },
            { src: 'images/vizualni-styl/vizualni-styl-5.jpg', filename: 'vizualni-styl-5.jpg' }
        ],
        'eventy': [
            { src: 'images/eventy/eventy-1.jpg', filename: 'eventy-1.jpg' }
        ],
        'pos': [
            { src: 'images/pos/pos-1.jpg', filename: 'pos-1.jpg' },
            { src: 'images/pos/pos-2.jpg', filename: 'pos-2.jpg' },
            { src: 'images/pos/pos-3.jpg', filename: 'pos-3.jpg' },
            { src: 'images/pos/pos-4.jpg', filename: 'pos-4.jpg' },
            { src: 'images/pos/pos-5.jpg', filename: 'pos-5.jpg' }
        ]
    };
    
    // Initialize the gallery
    initializeGallery();
    
    function initializeGallery() {
        try {
            // Process images to add unique IDs
            processImages(imageCategories);
            
            // Create filter buttons based on folder names
            createFilterButtons(Object.keys(allImagesByCategory));
            
            // Load initial set of images
            loadInitialImages();
            
            // Add event listeners to filter buttons
            setupFilterListeners();
            
            // Start color highlight effect
            startColorHighlight();
        } catch (error) {
            console.error('Error initializing gallery:', error);
            galleryContainer.innerHTML = `<div class="error">Error loading images. Please check the console for details.</div>`;
        }
    }
    
    /**
     * Processes images to add unique IDs and organize by category
     */
    function processImages(folderStructure) {
        allImagesByCategory = {};
        allImagesById = {};
        let id = 1;
        
        // Process all folders and images
        Object.keys(folderStructure).forEach(folder => {
            allImagesByCategory[folder] = [];
            
            folderStructure[folder].forEach(imageData => {
                // Create a new object with a unique ID and category
                const imageWithId = {
                    id: id++,
                    src: imageData.src,
                    folder: folder,
                    filename: imageData.filename
                };
                
                // Add to category collection
                allImagesByCategory[folder].push(imageWithId);
                
                // Add to all images collection
                allImagesById[imageWithId.id] = imageWithId;
            });
        });
        
        console.log('Processed images by category:', allImagesByCategory);
        console.log('All images by ID:', allImagesById);
    }
    
    /**
     * Creates filter buttons based on folder structure
     */
    function createFilterButtons(folders) {
        folders.forEach(folder => {
            const button = document.createElement('button');
            button.classList.add('filter-btn');
            button.setAttribute('data-filter', folder);
            
            // Format the folder name for display (capitalize first letter, replace hyphens with spaces)
            const displayName = folder
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            
            button.textContent = displayName;
            filterContainer.appendChild(button);
        });
    }
    
    /**
     * Starts the color highlight effect
     */
    function startColorHighlight() {
        // Clear any existing interval
        if (colorHighlightInterval) {
            clearInterval(colorHighlightInterval);
        }
        
        // Make sure all images are in grayscale via CSS class
        const allImages = document.querySelectorAll('.gallery-item img');
        allImages.forEach(img => {
            img.classList.remove('highlight-color');
        });
        
        // Set up color highlight every 1.5 seconds
        colorHighlightInterval = setInterval(() => {
            highlightAndReplaceImage();
        }, 1500);
    }
    
    /**
     * Highlights a random image in color and replaces it with a new one
     */
    function highlightAndReplaceImage() {
        // Get all visible items
        const visibleItems = Array.from(document.querySelectorAll('.gallery-item'));
        
        // If there are no items, don't do anything
        if (visibleItems.length === 0) return;
        
        // Remove highlight from previously highlighted image
        if (currentHighlightedImage) {
            currentHighlightedImage.classList.remove('highlight-color');
            
            // Get the parent container and current category
            const container = currentHighlightedImage.closest('.gallery-item');
            const category = container.getAttribute('data-category');
            const currentId = parseInt(container.getAttribute('data-image-id'));
            
            // Find a new image from the same category that's not currently displayed
            replaceImage(container, category, currentId);
        }
        
        // Select a random image
        const randomIndex = Math.floor(Math.random() * visibleItems.length);
        const selectedItem = visibleItems[randomIndex];
        const imgElement = selectedItem.querySelector('img');
        
        // Add highlight class
        imgElement.classList.add('highlight-color');
        
        // Store reference to currently highlighted image
        currentHighlightedImage = imgElement;
    }
    
    /**
     * Replaces an image with a new one from the same category
     */
    function replaceImage(container, category, currentId) {
        // Get available images from this category
        const categoryImages = allImagesByCategory[category] || [];
        
        // If no images available, return
        if (categoryImages.length === 0) {
            console.log(`No images available in category: ${category}`);
            return;
        }
        
        console.log(`Replacing image ID ${currentId} from category ${category}`);
        console.log(`Currently displayed IDs:`, displayedImageIds);
        
        // Find images not currently displayed in the gallery
        const availableImages = categoryImages.filter(img => 
            !displayedImageIds.has(img.id) && img.id !== currentId
        );
        
        console.log(`Available images not displayed: ${availableImages.length}`);
        
        // If we have new images to show, pick one randomly
        if (availableImages.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableImages.length);
            const newImage = availableImages[randomIndex];
            
            console.log(`Selected new image ID ${newImage.id}`);
            
            // Update image src and data attribute
            const img = container.querySelector('img');
            img.src = newImage.src;
            
            // Update tracking IDs
            displayedImageIds.delete(currentId);
            displayedImageIds.add(newImage.id);
            
            // Update container ID attribute
            container.setAttribute('data-image-id', newImage.id);
            
        } else {
            console.log(`No unused images available in category: ${category}`);
        }
    }
    
    /**
     * Loads initial set of images (up to MAX_IMAGES)
     */
    function loadInitialImages() {
        // Collect all images
        let allImages = [];
        Object.keys(allImagesByCategory).forEach(category => {
            allImages = allImages.concat(allImagesByCategory[category]);
        });
        
        // Shuffle the images
        shuffleArray(allImages);
        
        // Clear tracking
        displayedImageIds.clear();
        galleryContainer.innerHTML = '';
        
        // Select up to MAX_IMAGES
        const selectedImages = allImages.slice(0, MAX_IMAGES);
        
        // Track displayed image IDs
        selectedImages.forEach(img => displayedImageIds.add(img.id));
        
        console.log('Initial image IDs:', displayedImageIds);
        
        // Create elements
        selectedImages.forEach(imageData => {
            createImageElement(imageData);
        });
    }
    
    let currentExpandedItem = null; // Track the currently expanded item

    // Create a single reusable description box element
    const descriptionBox = document.createElement('div');
    descriptionBox.classList.add('description-box');
    descriptionBox.style.display = 'none'; // Initially hidden
    galleryContainer.parentNode.insertBefore(descriptionBox, galleryContainer.nextSibling); // Add it once to the DOM
    
    /**
     * Creates an image element and adds it to the gallery
     */
    function createImageElement(imageData) {
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('gallery-item');
        imageContainer.setAttribute('data-category', imageData.folder);
        imageContainer.setAttribute('data-image-id', imageData.id);
        // Store description data directly on the element
        imageContainer.setAttribute('data-title', imageData.filename.split('.')[0].replace(/-/g, ' '));
        imageContainer.setAttribute('data-cat-display', imageData.folder.replace(/-/g, ' '));
        // You might want a more specific way to store/retrieve the long description text
        imageContainer.setAttribute('data-desc-text', `This is a detailed description for ${imageData.filename}. It includes information about the design process, the client's requirements, and the final outcome. The text can be as long as needed.`); 

        const img = document.createElement('img');
        img.src = imageData.src;
        
        // Create minimize button
        const minimizeBtn = document.createElement('button');
        minimizeBtn.classList.add('minimize-btn');
        minimizeBtn.setAttribute('aria-label', 'Minimize');
        
        // Add click handler for minimize button
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event from bubbling to gallery item
            if (currentExpandedItem) {
                currentExpandedItem.classList.remove('expanded');
                descriptionBox.style.display = 'none'; // Hide the shared description box
                currentExpandedItem = null;
            }
        });
        
        imageContainer.appendChild(img);
        imageContainer.appendChild(minimizeBtn);
        
        // REMOVED: Creation of individual description box here
        
        // Add click handler for expansion
        imageContainer.addEventListener('click', (e) => {
            // If clicking the minimize button area, do nothing (handled above)
            if (e.target === minimizeBtn) return;

            // If clicking the already expanded item, do nothing
            if (currentExpandedItem === imageContainer) {
                return;
            }
            
            // Collapse any previously expanded item
            if (currentExpandedItem) {
                currentExpandedItem.classList.remove('expanded');
            }

            // Update and show the shared description box
            const title = imageContainer.getAttribute('data-title');
            const categoryDisplay = imageContainer.getAttribute('data-cat-display');
            const descText = imageContainer.getAttribute('data-desc-text');

            descriptionBox.innerHTML = `
                <h3>${title}</h3>
                <span class="category">${categoryDisplay}</span>
                <p>${descText}</p>
            `;
            descriptionBox.style.display = ''; // Make it visible
            
            // Expand the clicked item
            imageContainer.classList.add('expanded');
            currentExpandedItem = imageContainer; // Track new expanded item
            
            // Insert description box after the expanded item
            // Check if galleryContainer is the parent before inserting
            if (imageContainer.parentNode === galleryContainer) {
                galleryContainer.insertBefore(descriptionBox, imageContainer.nextSibling);
            } else {
                // Fallback or error handling if parent is not galleryContainer
                console.warn('Expanded item parent is not galleryContainer');
                // Potentially insert relative to imageContainer directly if structure allows
                imageContainer.after(descriptionBox);
            }

            // Ensure the expanded item is visible
            // Use a slight delay to allow the DOM update to settle before scrolling
            setTimeout(() => {
                imageContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 50); 
        });
        
        galleryContainer.appendChild(imageContainer);
    }
    
    /**
     * Sets up event listeners for filter buttons
     */
    function setupFilterListeners() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to current button
                button.classList.add('active');
                
                const filter = button.getAttribute('data-filter');
                filterGallery(filter);
                
                // Restart color highlight after filter change
                startColorHighlight();
            });
        });
    }
    
    /**
     * Filters the gallery based on the selected category
     */
    function filterGallery(filter) {
        const items = document.querySelectorAll('.gallery-item');
        
        // Reset all items to initial state
        items.forEach(item => {
            item.classList.remove('show', 'hide');
            // Force a reflow to ensure the reset is applied
            void item.offsetWidth;
        });
        
        // First, hide all items with animation
        items.forEach(item => {
            item.classList.add('hide');
        });
        
        // After a short delay, show the filtered items
        setTimeout(() => {
            items.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    item.classList.remove('hide');
                    // Small delay to ensure the hide animation completes
                    setTimeout(() => {
                        item.classList.add('show');
                    }, 50);
                }
            });
        }, 400); // Increased delay to ensure smooth transition
    }
    
    /**
     * Shuffles an array in place using Fisher-Yates algorithm
     */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}); 