const Clouds = {
    init: function () {
        const cloudTL = document.querySelectorAll('.clouds .cloudTL');
        const cloudTR = document.querySelectorAll('.clouds .cloudTR');
        const cloudBL = document.querySelectorAll('.clouds .cloudBL');
        const cloudBR = document.querySelectorAll('.clouds .cloudBR');
        console.log(cloudTL, cloudTR, cloudBL, cloudBR);
    }
}

const Warnings = {
    list: [],
    init: function () {
        this.list.push(this.createWarning('Ты точно спишь???'));
    },
    createWarning: function (message) {
        const warning = document.createElement('div');
        warning.className = 'warning';
        warning.innerHTML = `
        <div class="warning-container">
            <div class="warning-header">Предупреждение</div>
            <div class="warning-body">
                <img src="/assets/img/warning.png" class="warning-icon"/>
                <a class="warning-message">${message}</a>
            </div>
            <div class="warning-close">Отмена</div>
        </div>
        `;
        warning.querySelector('.warning-close').onclick = function () {
            warning.remove();
        }
        
        // document.body.appendChild(warning);
        return warning;
    },
}

const Infos = {
    list: [],
    init: function () {
        this.list.push(this.createInfo('Мне снилось, что ...'));
    },    
    createInfo: function (message) {
        const info = document.createElement('div');
        info.className = 'info';
        info.innerHTML = `
        <div class="info-container">
            <div class="info-header">Что тебе снилось?</div>
            <div class="info-body">
                <img src="/assets/img/exc.png" class="info-icon"/>
                <a class="info-message">${message}</a>
            </div>
            <div class="info-close">
                <a class="info-close-text">ОК</a>
            </div>
        </div>
        `;

        const infoMessage = info.querySelector('.info-message');
        const infoContainer = info.querySelector('.info-container');
        
        if (message.includes('...')) {
            // Add a space before the editable span if there isn't one already
            infoMessage.innerHTML = message.replace('...', ' <span class="editable">...</span>');
            const editableSpan = infoMessage.querySelector('.editable');
            
            // Add styles to remove outline and border when editing
            const editorStyles = document.createElement('style');
            editorStyles.textContent = `
                .editable:focus {
                    outline: none;
                    border: none;
                    box-shadow: none;
                }
                .editable {
                    display: inline-block;
                    min-width: 20px;
                }
            `;
            document.head.appendChild(editorStyles);
            
            infoMessage.addEventListener('click', function(e) {
                // Only make the span editable, not the whole message
                if (e.target.classList.contains('editable')) {
                    editableSpan.contentEditable = true;
                    editableSpan.focus();
                    
                    // Select all text in the editable span
                    const range = document.createRange();
                    range.selectNodeContents(editableSpan);
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                    
                    // Replace the "..." with empty string when user starts typing
                    editableSpan.addEventListener('input', function onFirstInput() {
                        if (this.textContent.includes('...')) {
                            this.textContent = this.textContent.replace('...', '');
                            // Reposition cursor
                            const newRange = document.createRange();
                            newRange.setStart(this.firstChild || this, 0);
                            newRange.collapse(true);
                            sel.removeAllRanges();
                            sel.addRange(newRange);
                        }
                        this.removeEventListener('input', onFirstInput);
                    });
                }
            });
            
            // Handle blur event
            editableSpan.addEventListener('blur', function() {
                this.contentEditable = false;
            });
            
            // Prevent default behavior on Enter key
            editableSpan.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.blur();
                }
            });
        }
        
        info.querySelector('.info-close-text').onclick = function () {
            // Get the user's entered dream text
            const infoMessage = info.querySelector('.info-message');
            const userDream = infoMessage.textContent.replace('Мне снилось, что ', '').trim();
            
            // Check if the placeholder was filled (not empty and not "...")
            if (userDream && userDream !== '...') {
                alert(`Спасибо за ваш ответ! Скоро ваш сон "${userDream}" станет реальностью.`);
            }
            
            info.remove();
        }
        // document.body.appendChild(info);
        return info;
    }
}

const Pupil = {
    create: function(eyeCenterX, eyeCenterY, eyeRadius, pupilRadius) {
        // Save the page coordinates of the eye center
        const pageEyeCenterX = eyeCenterX;
        const pageEyeCenterY = eyeCenterY;
        
        // Create pupil element
        const pupil = document.createElement('div');
        pupil.className = 'pupil';
        
        // Set initial styles
        pupil.style.position = 'fixed'; // Changed from absolute to fixed
        pupil.style.width = pupilRadius * 2 + 'px';
        pupil.style.height = pupilRadius * 2 + 'px';
        pupil.style.borderRadius = '50%';
        pupil.style.backgroundColor = 'black';
        pupil.style.transform = 'translate(-50%, -50%)'; // Center the pupil
        
        // Add to document
        document.body.appendChild(pupil);
        
        // Calculate maximum distance pupil can move from center
        const maxDistance = eyeRadius - pupilRadius;
        
        // Track last mouse position in viewport coordinates
        let lastMouseX = 0;
        let lastMouseY = 0;
        
        // Function to update pupil position based on current scroll and mouse
        function updatePupilPosition(mouseX, mouseY) {
            // Convert page coordinates to viewport coordinates
            const viewportEyeX = pageEyeCenterX - window.pageXOffset;
            const viewportEyeY = pageEyeCenterY - window.pageYOffset;
            
            // Calculate direction vector from eye center to mouse
            let dirX = mouseX - viewportEyeX;
            let dirY = mouseY - viewportEyeY;
            
            // Calculate distance from eye center to mouse
            const distance = Math.sqrt(dirX * dirX + dirY * dirY);
            
            // Update pupil position
            if (distance > 0) {
                // Normalize direction and scale by maxDistance
                const moveX = (dirX / distance) * Math.min(distance, maxDistance);
                const moveY = (dirY / distance) * Math.min(distance, maxDistance);
                
                // Position pupil
                const pupilX = viewportEyeX + moveX;
                const pupilY = viewportEyeY + moveY;
                
                // Update position
                pupil.style.left = pupilX + 'px';
                pupil.style.top = pupilY + 'px';
            }
        }
        
        // Add mouse move event listener
        document.addEventListener('mousemove', function(e) {
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            updatePupilPosition(lastMouseX, lastMouseY);
        });
        
        // Add scroll event listener
        window.addEventListener('scroll', function() {
            updatePupilPosition(lastMouseX, lastMouseY);
        });
        
        // Initial position update
        updatePupilPosition(
            pageEyeCenterX - window.pageXOffset, 
            pageEyeCenterY - window.pageYOffset
        );
        
        return pupil;
    }
};

function addTypingEffectToLyrics() {
    const lyrics = document.querySelector('.lyrics');
    if (!lyrics) return;
    
    // Store the original HTML
    const originalHTML = lyrics.innerHTML;
    
    // Calculate initial content (first verse/paragraph)
    initialEndIndex = 10;
    
    // Extract initial content, making sure not to cut HTML tags
    let initialContent = '';
    let i = 0;
    while (i < initialEndIndex) {
        if (originalHTML[i] === '<') {
            // Find the end of the tag
            const endTagIndex = originalHTML.indexOf('>', i);
            if (endTagIndex !== -1) {
                // Add the entire tag
                initialContent += originalHTML.substring(i, endTagIndex + 1);
                i = endTagIndex + 1;
            } else {
                // If no closing bracket, just add the character
                initialContent += originalHTML[i];
                i++;
            }
        } else {
            // Add regular character
            initialContent += originalHTML[i];
            i++;
        }
    }
    
    // Set initial content
    lyrics.innerHTML = initialContent;
    
    // Start typing from where we left off
    let index = i;
    let currentHTML = initialContent;
    
    function typeNextChar() {
        if (index >= originalHTML.length) return;
        
        // Check if we're at the start of an HTML tag
        if (originalHTML[index] === '<') {
            // Find the end of the tag
            const endTagIndex = originalHTML.indexOf('>', index);
            if (endTagIndex !== -1) {
                // Add the entire tag at once
                currentHTML += originalHTML.substring(index, endTagIndex + 1);
                index = endTagIndex + 1;
                // Update the HTML
                lyrics.innerHTML = currentHTML;
                // Continue typing immediately
                typeNextChar();
                return;
            }
        }
        
        // Add the next character
        currentHTML += originalHTML[index];
        lyrics.innerHTML = currentHTML;
        index++;
        
        // Random delay between 50ms and 200ms
        const delay = Math.random() * 150 + 50;
        setTimeout(typeNextChar, delay);
    }
    
    // Start typing the rest after a short delay
    setTimeout(typeNextChar, 300);
}

// Character Editor functionality
const CharEditor = {
    highestZIndex: 1,
    defaultBgColor: '#D9D9D9',
    canvaElements: [],
    heldElement: null,
    
    init: function() {
        // Initialize draggable elements
        const elements = document.querySelectorAll('.element-container .element');
        elements.forEach(element => {
            element.setAttribute('draggable', 'true');
            element.addEventListener('dragstart', this.handleDragStart.bind(this));
            element.addEventListener('dragend', this.handleDragEnd.bind(this));
            
            // Store original position
            element.dataset.originalParent = element.parentElement.className;
        });
        
        // Setup canva drop area
        const canva = document.querySelector('.canva');
        canva.addEventListener('dragover', this.handleDragOver.bind(this));
        canva.addEventListener('dragenter', this.handleDragEnter.bind(this));
        canva.addEventListener('dragleave', this.handleDragLeave.bind(this));
        canva.addEventListener('drop', this.handleDrop.bind(this));
        
        // Setup background color pickers
        const pickers = document.querySelectorAll('.background-picker .picker');
        pickers.forEach(picker => {
            picker.addEventListener('click', this.handleBackgroundChange.bind(this));
        });
        
        // Setup clear button
        const clearButton = document.querySelector('.element-clear');
        clearButton.onclick = this.clearElements.bind(this);
        
        // Track clicks on elements in canva for z-index management
        canva.addEventListener('mousedown', this.handleCanvaElementClick.bind(this));
        
        // Add mouse up event listener to track when elements are no longer held
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Add wheel event listener for rotation
        canva.addEventListener('wheel', this.handleWheel.bind(this));
    },
    
    handleDragStart: function(e) {
        // Store reference to the dragged element
        this.draggedElement = e.target;
        e.dataTransfer.setData('text/plain', ''); // Required for Firefox
        
        // Create a clone if the element is inside the canva
        if (e.target.parentElement.className === 'canva') {
            this.isDraggingFromCanva = true;
            // Set the element's position to absolute for accurate positioning
            const rect = e.target.getBoundingClientRect();
            e.dataTransfer.setDragImage(e.target, rect.width/2, rect.height/2);
        } else {
            this.isDraggingFromCanva = false;
        }
    },
    
    handleDragOver: function(e) {
        // Prevent default to allow drop
        e.preventDefault();
    },
    
    handleDragEnter: function(e) {
        e.preventDefault();
        e.target.classList.add('drag-over');
    },
    
    handleDragLeave: function(e) {
        e.target.classList.remove('drag-over');
    },
    
    handleDrop: function(e) {
        e.preventDefault();
        e.target.classList.remove('drag-over');
        
        // Only handle drop if the target is the canva or an element inside it
        if (e.target.className === 'canva' || e.target.parentElement.className === 'canva') {
            const canva = e.target.className === 'canva' ? e.target : e.target.parentElement;
            
            // If we're dragging from original element container, create a clone
            if (!this.isDraggingFromCanva) {
                const clone = this.draggedElement.cloneNode(true);
                clone.style.position = 'absolute';
                clone.style.zIndex = ++this.highestZIndex;
                clone.setAttribute('draggable', 'true');
                clone.addEventListener('dragstart', this.handleDragStart.bind(this));
                clone.addEventListener('dragend', this.handleDragEnd.bind(this));
                
                // Position the element where it was dropped
                const canvaRect = canva.getBoundingClientRect();
                clone.style.left = (e.clientX - canvaRect.left - (clone.offsetWidth / 2)) + 'px';
                clone.style.top = (e.clientY - canvaRect.top - (clone.offsetHeight / 2)) + 'px';
                
                canva.appendChild(clone);
                this.canvaElements.push(clone);
            } else {
                // Update position if dragging an element already in canva
                const canvaRect = canva.getBoundingClientRect();
                this.draggedElement.style.left = (e.clientX - canvaRect.left - (this.draggedElement.offsetWidth / 2)) + 'px';
                this.draggedElement.style.top = (e.clientY - canvaRect.top - (this.draggedElement.offsetHeight / 2)) + 'px';
                this.draggedElement.style.zIndex = ++this.highestZIndex;
            }
        } else if (this.isDraggingFromCanva) {
            // If dragging from canva but dropped outside, remove the element
            this.draggedElement.remove();
            this.canvaElements = this.canvaElements.filter(el => el !== this.draggedElement);
        }
    },
    
    handleDragEnd: function(e) {
        // Reset dragged element reference
        this.draggedElement = null;
        this.isDraggingFromCanva = false;
    },
    
    handleCanvaElementClick: function(e) {
        // If clicking an element inside canva, bring it to front
        if (e.target.tagName === 'IMG' && e.target.parentElement.className === 'canva') {
            e.target.style.zIndex = ++this.highestZIndex;
            // Store reference to currently held element
            this.heldElement = e.target;
            
            // If element doesn't have a rotation yet, initialize it
            if (!this.heldElement.style.transform) {
                this.heldElement.style.transform = 'rotate(0deg)';
            }
        }
    },
    
    handleMouseUp: function(e) {
        // Clear the held element reference
        this.heldElement = null;
    },
    
    handleWheel: function(e) {
        // If an element is being held, rotate it
        if (this.heldElement) {
            e.preventDefault(); // Prevent page scrolling
            
            // Get current rotation or default to 0
            let currentRotation = 0;
            const transform = this.heldElement.style.transform;
            if (transform) {
                const match = transform.match(/rotate\((-?\d+)deg\)/);
                if (match && match[1]) {
                    currentRotation = parseInt(match[1], 10);
                }
            }
            
            // Determine rotation direction based on scroll direction
            // deltaY positive means scrolling down, negative means scrolling up
            const rotationAmount = e.deltaY > 0 ? 15 : -15;
            
            // Calculate new rotation
            const newRotation = currentRotation + rotationAmount;
            
            // Apply new rotation
            this.heldElement.style.transform = `rotate(${newRotation}deg)`;
        }
    },
    
    handleBackgroundChange: function(e) {
        const bgColor = e.target.style.backgroundColor;
        document.querySelector('.canva').style.backgroundColor = bgColor;
    },
    
    clearElements: function() {
        // Remove all elements from canva
        const canva = document.querySelector('.canva');
        this.canvaElements.forEach(element => {
            element.remove();
        });
        this.canvaElements = [];
        
        // Reset canva background to default
        canva.style.backgroundColor = this.defaultBgColor;
        
        // Reset z-index counter
        this.highestZIndex = 1;
        
        // Also reset the held element reference
        this.heldElement = null;
    }
};

// Track mouse position globally
let mouseX = 0;
let mouseY = 0;

// Update mouse position when mouse moves
document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Function to create warning at cursor position
function createCursorWarning() {
    const warningMessage = "Rah, rah-ah-ah-ah Roma, roma-ma Gaga, ooh-la-la Want your bad romance";
    const warning = Warnings.createWarning(warningMessage);
    
    // Position at cursor but make it invisible while we measure
    warning.style.position = 'absolute';
    warning.style.visibility = 'hidden';
    
    // Add to DOM to get dimensions
    document.body.appendChild(warning);
    const warningWidth = warning.offsetWidth;
    const warningHeight = warning.offsetHeight;
    
    // Calculate position that ensures warning stays in viewport
    // Add scroll offset to convert viewport coordinates to document coordinates
    let posX = mouseX + window.scrollX;
    let posY = mouseY + window.scrollY;
    
    // Adjust if warning would go off right edge
    if (mouseX + warningWidth > window.innerWidth) {
        posX = window.scrollX + window.innerWidth - warningWidth - 10;
    }
    
    // Adjust if warning would go off bottom edge
    if (mouseY + warningHeight > window.innerHeight) {
        posY = window.scrollY + window.innerHeight - warningHeight - 10;
    }
    
    // Set the final position and make visible
    warning.style.left = posX + 'px';
    warning.style.top = posY + 'px';
    warning.style.visibility = 'visible';
    warning.style.zIndex = 1000; // Increased z-index to ensure visibility
}

// Function to schedule random warnings
function scheduleRandomWarning() {
    // Random interval between 10-30 seconds
    const randomInterval = Math.floor(Math.random() * 20000) + 10000;
    
    setTimeout(() => {
        // Create the warning
        createCursorWarning();
        
        // Schedule the next one
        scheduleRandomWarning();
    }, randomInterval);
}

document.addEventListener('DOMContentLoaded', function () {
    // Add to the end of your DOMContentLoaded function
    scheduleRandomWarning();
    // Clouds.init();
    // Warnings.init();
    // Infos.init();
    
    // Add typing effect to lyrics
    addTypingEffectToLyrics();
    
    const warningPlaceholder = document.getElementById("warning-placeholder");
    const warningMessages = [
        'Ты точно спишь???', 
        'Что тебе снилось?', 
        'Ты уже проснулся?',
    ];
    
    // Get the position of the warning placeholder
    const placeholderRect = warningPlaceholder.getBoundingClientRect();
    const baseX = placeholderRect.left + 100;
    const baseY = placeholderRect.top + 300;
    
    // Add animation style
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        @keyframes warningAppear {
            from { transform: scale(0.3); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .warning {
            position: absolute;
            animation: warningAppear 0.3s ease-out;
            transform-origin: center;
        }
    `;
    document.head.appendChild(styleSheet);
    
    // Function to create and position a warning
    function createPositionedWarning(message, x, y, positionId) {
        const warning = Warnings.createWarning(message);
        warning.style.position = 'absolute';
        warning.style.left = x + 'px';
        warning.style.top = y + 'px';
        warning.style.zIndex = 1000 - positionId; // Higher warnings appear on top
        warning.dataset.positionId = positionId; // Store position ID for recreation
        warning.dataset.posX = x;
        warning.dataset.posY = y;
        
        // Override the close button functionality
        const closeBtn = warning.querySelector('.warning-close');
        closeBtn.onclick = function() {
            warning.remove();
            // Wait 3 seconds and create new warning at the same position
            setTimeout(() => {
                const newWarning = createPositionedWarning(
                    warningMessages[Math.floor(Math.random() * warningMessages.length)],
                    parseInt(warning.dataset.posX),
                    parseInt(warning.dataset.posY),
                    warning.dataset.positionId
                );
                document.body.appendChild(newWarning);
            }, 3000);
        };
        
        return warning;
    }
    
    // Create cascading warnings
    for (let i = 0; i < 3; i++) {
        const offsetX = +i * (60 + Math.random() * 20); // 60-80px to the left
        const offsetY = -i * (60 + Math.random() * 20); // 60-80px higher
        const warning = createPositionedWarning(
            warningMessages[i % warningMessages.length],
            baseX + offsetX,
            baseY + offsetY,
            i
        );
        document.body.appendChild(warning);
    }

    // Add info boxes to the info-placeholder
    const infoPlaceholder = document.getElementById("info-placeholder");
    const infoMessages = [
        'Мне снилось, что я ...', 
        'Мне снилось, что я ...', 
        'Мне снилось, что я ...',
    ];
    
    // Get the position of the info placeholder
    const infoPlaceholderRect = infoPlaceholder.getBoundingClientRect();
    const infoBaseX = infoPlaceholderRect.left + 100;
    const infoBaseY = infoPlaceholderRect.top + 200;
    
    // Add animation style for info boxes if not already added
    if (!document.querySelector('style').textContent.includes('infoAppear')) {
        const infoStyleSheet = document.createElement("style");
        infoStyleSheet.textContent = `
            @keyframes infoAppear {
                from { transform: scale(0.3); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            .info {
                position: absolute;
                animation: infoAppear 0.3s ease-out;
                transform-origin: center;
            }
        `;
        document.head.appendChild(infoStyleSheet);
    }
    
    // Function to create and position an info box
    function createPositionedInfo(message, x, y, positionId) {
        const info = Infos.createInfo(message);
        info.style.position = 'absolute';
        info.style.left = x + 'px';
        info.style.top = y + 'px';
        info.style.zIndex = 500 - positionId; // Higher info boxes appear on top
        info.dataset.positionId = positionId; // Store position ID for recreation
        info.dataset.posX = x;
        info.dataset.posY = y;
        
        // Override the close button functionality
        const closeBtn = info.querySelector('.info-close-text');
        closeBtn.onclick = function() {
            const infoMessage = info.querySelector('.info-message');
            console.log(infoMessage)
            const userDream = infoMessage.textContent.replace('Мне снилось, что я ', '').trim();
            
            // Check if the placeholder was filled (not empty and not "...")
            if (userDream && userDream !== '...') {
                alert(`Спасибо за ваш ответ! Скоро ваш сон "${userDream}" станет реальностью.`);
            }
            info.remove();
            // Wait 4 seconds and create new info box at the same position
            setTimeout(() => {
                const newInfo = createPositionedInfo(
                    infoMessages[Math.floor(Math.random() * infoMessages.length)],
                    parseInt(info.dataset.posX),
                    parseInt(info.dataset.posY),
                    info.dataset.positionId
                );
                document.body.appendChild(newInfo);
            }, 4000);
        };
        
        return info;
    }
    
    // Create the info boxes with specified positioning
    // First box - slightly to the right
    const info1 = createPositionedInfo(
        infoMessages[0],
        infoBaseX + 20,
        infoBaseY,
        0
    );
    document.body.appendChild(info1);
    
    // Second box - 120px to the left and above
    const info2 = createPositionedInfo(
        infoMessages[1],
        infoBaseX - 120,
        infoBaseY - 70,
        1
    );
    document.body.appendChild(info2);
    
    // Third box - somewhere between them and above
    const info3 = createPositionedInfo(
        infoMessages[2],
        infoBaseX - 50,
        infoBaseY - 140,
        2
    );
    document.body.appendChild(info3);

    lyrics = document.querySelector('.lyrics');
    flower1 = document.createElement('img');
    flower1.src = '/assets/img/flowers1.png';
    document.body.appendChild(flower1);
    flower1.style.position = 'absolute';
    flower1.style.left = '1%';
    flower1.style.top = `${lyrics.offsetTop - 290}px`;
    // Wait for the flower image to load to get its dimensions
    flower1.onload = function() {
        // Calculate center of the flower
        const flowerWidth = flower1.offsetWidth;
        const flowerHeight = flower1.offsetHeight;
        
        // Get flower position
        const flowerLeft = flower1.offsetLeft + (flowerWidth / 2);
        const flowerTop = flower1.offsetTop + (flowerHeight / 2);
        
        // Create pupil at the center of the flower
        // Parameters: centerX, centerY, eyeRadius, pupilRadius
        Pupil.create(flowerLeft - 25, flowerTop, flowerWidth * 0.19, flowerWidth * 0.1);
    };

    flower2 = document.createElement('img');
    flower2.src = '/assets/img/flowers2.png';
    document.body.appendChild(flower2);
    flower2.style.position = 'absolute';
    flower2.style.left = '36%';
    flower2.style.top = `${lyrics.offsetTop - 180}px`;
    flower2.onload = function() {
        const flowerWidth = flower2.offsetWidth;
        const flowerHeight = flower2.offsetHeight;
        
        // Get flower position
        const flowerLeft = flower2.offsetLeft + (flowerWidth / 2);
        const flowerTop = flower2.offsetTop + (flowerHeight / 2);
        
        // Create pupil at the center of the flower
        Pupil.create(flowerLeft - 5, flowerTop - 15, flowerWidth * 0.15, flowerWidth * 0.07);
    };

    planet = document.createElement('img');
    planet.src = '/assets/img/planet.png';
    document.body.appendChild(planet);
    planet.style.position = 'absolute';
    planet.style.left = '69%';
    planet.style.top = `${lyrics.offsetTop - 100}px`;
    planet.style.zIndex = 5;
    planet.style.mixBlendMode = 'exclusion';
    planet.classList.add('dragable');

    // Initialize Character Editor
    CharEditor.init();
    
    // Make elements with class 'dragable' and position absolute draggable
    function makeDraggable(element) {
        let isDragging = false;
        let initialX, initialY;
        let currentX, currentY;
        
        element.addEventListener('mousedown', startDrag);
        
        function startDrag(e) {
            // Prevent default to avoid text selection
            e.preventDefault();
            
            // Get initial mouse position
            initialX = e.clientX;
            initialY = e.clientY;
            
            // Get current element position
            const style = window.getComputedStyle(element);
            currentX = parseInt(style.left) || 0;
            currentY = parseInt(style.top) || 0;
            
            // Start listening for mouse movement and release
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
            
            // Add a class to indicate dragging state
            element.classList.add('dragging');
            isDragging = true;
        }
        
        function drag(e) {
            if (isDragging) {
                // Calculate the new position
                const dx = e.clientX - initialX;
                const dy = e.clientY - initialY;
                
                // Update element position
                element.style.left = (currentX + dx) + 'px';
                element.style.top = (currentY + dy) + 'px';
            }
        }
        
        function stopDrag() {
            // Remove event listeners
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
            
            // Remove dragging class
            element.classList.remove('dragging');
            isDragging = false;
        }
    }
    
    // Function to make dialogs draggable by header
    function makeDialogDraggable(dialog, handle) {
        let isDragging = false;
        let initialX, initialY;
        let currentX, currentY;
        
        handle.addEventListener('mousedown', startDrag);
        
        function startDrag(e) {
            // Don't start drag when clicking close buttons
            if (e.target.closest('.warning-close') || e.target.closest('.info-close-text')) {
                return;
            }
            
            e.preventDefault();
            
            // Get initial positions
            initialX = e.clientX;
            initialY = e.clientY;
            
            const style = window.getComputedStyle(dialog);
            currentX = parseInt(style.left) || 0;
            currentY = parseInt(style.top) || 0;
            
            // Add event listeners for drag
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
            
            dialog.classList.add('dragging');
            isDragging = true;
        }
        
        function drag(e) {
            if (isDragging) {
                const dx = e.clientX - initialX;
                const dy = e.clientY - initialY;
                
                dialog.style.left = (currentX + dx) + 'px';
                dialog.style.top = (currentY + dy) + 'px';
            }
        }
        
        function stopDrag() {
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
            
            dialog.classList.remove('dragging');
            isDragging = false;
        }
    }
    
    // Apply to existing dragable elements
    const dragables = document.querySelectorAll('.dragable');
    dragables.forEach(element => {
        if (window.getComputedStyle(element).position === 'absolute') {
            makeDraggable(element);
        }
    });
    
    // Observer to catch dynamically created elements
    const dragObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                // Skip non-element nodes
                if (node.nodeType !== Node.ELEMENT_NODE) return;
                
                // Make dragable elements draggable
                if (node.classList && node.classList.contains('dragable') && 
                    window.getComputedStyle(node).position === 'absolute') {
                    makeDraggable(node);
                }
                
                // Make warnings draggable by header
                if (node.classList && node.classList.contains('warning')) {
                    const header = node.querySelector('.warning-header');
                    if (header) makeDialogDraggable(node, header);
                }
                
                // Make info boxes draggable by header
                if (node.classList && node.classList.contains('info')) {
                    const header = node.querySelector('.info-header');
                    if (header) makeDialogDraggable(node, header);
                }
            });
        });
    });
    
    // Start observing the DOM for added nodes
    dragObserver.observe(document.body, { childList: true, subtree: true });
    
    // Add styles for smooth transitions
    const dragStyles = document.createElement('style');
    dragStyles.textContent = `
        .dragable:not(.dragging), .warning:not(.dragging), .info:not(.dragging) {
            transition: left 0.2s ease, top 0.2s ease;
        }
        .dragging {
            cursor: grabbing !important;
            z-index: 9999 !important;
        }
        .warning-header, .info-header {
            cursor: grab;
        }
    `;
    document.head.appendChild(dragStyles);
    
    // Also make existing warnings/infos draggable
    document.querySelectorAll('.warning').forEach(warning => {
        const header = warning.querySelector('.warning-header');
        if (header) makeDialogDraggable(warning, header);
    });
    
    document.querySelectorAll('.info').forEach(info => {
        const header = info.querySelector('.info-header');
        if (header) makeDialogDraggable(info, header);
    });

    const griby = document.querySelectorAll('.grib');
    griby.forEach(grib => {
        const footer = document.querySelector('.footer');
        const gribWidth = grib.clientWidth;
        const gribHeight = grib.clientWidth * (473 / 300);
        let gribLeft = grib.offsetLeft + (gribWidth / 2);
        let gribTop = grib.offsetTop + (gribHeight / 2);
        gribLeft += footer.offsetLeft;
        gribTop += footer.offsetTop;

        console.log(gribWidth, gribHeight);

        // Create pupil at the center of the flower
        const pupil = Pupil.create(gribLeft + 15, gribTop - (gribHeight / 3.3), gribWidth * 0.2, gribHeight * 0.06);
        // Move pupil from body to footer
        document.body.removeChild(pupil);
        if (footer) {
            footer.appendChild(pupil);
        } else {
            console.error('Footer not found');
            // Re-add to body if footer doesn't exist
            document.body.appendChild(pupil);
        }
        pupil.style.zIndex = 5;
    });   
    
    // Add smiley with message popup
    const charEditor = document.querySelector('.char-editor');
    if (charEditor) {
        // Create smiley element
        const smiley = document.createElement('img');
        smiley.src = '/assets/img/smiley.png';
        smiley.classList.add('smiley-icon');
        document.body.appendChild(smiley);
        
        // Style the smiley
        smiley.style.position = 'absolute';
        smiley.style.left = '10%';
        smiley.style.top = (charEditor.offsetTop - 90) + 'px';
        smiley.style.width = '100px';
        smiley.style.cursor = 'pointer';
        smiley.style.zIndex = '10';
        
        // Create message container
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message-popup');
        document.body.appendChild(messageContainer);
        
        // Create and add message image
        const messageImg = document.createElement('img');
        messageImg.src = '/assets/img/message.png';
        messageImg.classList.add('message-image');
        messageContainer.appendChild(messageImg);
        
        // Style the message container and image
        messageContainer.style.position = 'absolute';
        messageContainer.style.display = 'none'; // Initially hidden
        messageContainer.style.zIndex = '15';
        messageContainer.style.left = (parseInt(smiley.style.left) - 30) + 'px';
        messageContainer.style.top = (charEditor.offsetTop - 180) + 'px';
        
        // Add indicator styling
        const messageStyles = document.createElement('style');
        messageStyles.textContent = `
            .message-popup::after {
                position: absolute;
                bottom: -10px;
                left: 40px;
                border-width: 10px 10px 0;
                border-style: solid;
                border-color: white transparent transparent;
                z-index: 16;
            }
            
            .message-image {
                max-width: 200px;
                filter: drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.3));
            }
        `;
        document.head.appendChild(messageStyles);
        
        // Add hover event listeners
        smiley.addEventListener('mouseenter', function() {
            messageContainer.style.display = 'block';
            messageContainer.style.position = 'absolute';
            messageContainer.style.left = (smiley.getBoundingClientRect().left + 50) + 'px';
        });
        
        smiley.addEventListener('mouseleave', function() {
            messageContainer.style.display = 'none';
        });

        flower3 = document.createElement('img');
        flower3.src = '/assets/img/flowers4.png';
        document.body.appendChild(flower3);
        flower3.style.position = 'absolute';
        flower3.style.right = '7%';
        flower3.style.top = (charEditor.offsetTop - 700) + 'px';
        flower3.style.width = '500px';
        flower3.style.zIndex = '0';
        flower3.style.zIndex = 0;

        flower3.onload = function() {
            const flowerWidth = flower3.offsetWidth;
            const flowerHeight = flower3.offsetHeight;
            
            // Get flower position
            const flowerLeft = flower3.offsetLeft + (flowerWidth / 2);
            const flowerTop = flower3.offsetTop + (flowerHeight / 2);
            
            // Create pupil at the center of the flower
            Pupil.create(flowerLeft - 19, flowerTop + 14, flowerWidth * 0.13, flowerWidth * 0.07);
        };

        flower4 = document.createElement('img');
        flower4.src = '/assets/img/flowers3.png';
        document.body.appendChild(flower4);
        flower4.style.position = 'absolute';
        flower4.style.right = '36%';
        flower4.style.top = (charEditor.offsetTop - 320) + 'px';
        flower4.style.width = '400px';
        flower4.style.zIndex = '0';
        flower4.style.zIndex = 0;

        flower4.onload = function() {
            const flowerWidth = flower4.offsetWidth;
            const flowerHeight = flower4.offsetHeight;
            
            // Get flower position
            const flowerLeft = flower4.offsetLeft + (flowerWidth / 2);
            const flowerTop = flower4.offsetTop + (flowerHeight / 2);
            
            // Create pupil at the center of the flower
            Pupil.create(flowerLeft, flowerTop - 4, flowerWidth * 0.23, flowerWidth * 0.1);
        };
    }
});