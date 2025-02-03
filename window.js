
let windowCount = 1;
let zIndexCounter = 1; // Initial value for z-index

function createWindow() {
    //const desktop = document.querySelector('.container');
    const desktop = document.getElementById('tabContent');
    const newWindow = document.createElement('div');
    newWindow.className = 'window';
    newWindow.id = generateRandomId();

    const titleBar = document.createElement('div');
    titleBar.className = 'title-bar';
    titleBar.innerHTML = `<span id="windowTitle" style="margin-left: 20px;"></span>`;

    const content = document.createElement('div');
    content.className = 'content';

    newWindow.appendChild(titleBar);
    newWindow.appendChild(content);
    //desktop.appendChild(newWindow);

    // Center the window
    newWindow.style.left = `calc(50% - 270px)`; // 150px is half of the window width
    newWindow.style.top = `calc(50% - 290px)`; // 100px is half of the window height

    // Set initial z-index
    newWindow.style.zIndex = zIndexCounter++;

    // Add inactive overlay to all other windows and the desktop
    document.querySelectorAll('.window').forEach(win => {
        if (win !== newWindow) {
            let overlay = win.querySelector('.inactive-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'inactive-overlay';
                win.appendChild(overlay);
            }
        }
    });

    // Always add inactive overlay to the desktop controls
    const desktopControls = document.getElementById('desktop-controls');
   //const desktopControls = document.getElementById('tabContent');
    let overlay = desktopControls.querySelector('.inactive-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'inactive-overlay';
        desktopControls.appendChild(overlay);
    }

    // Remove inactive overlay from the new window
    const overlayToRemove = newWindow.querySelector('.inactive-overlay');
    if (overlayToRemove) {
        overlayToRemove.remove();
    }

    addWindowFunctionality(newWindow);
    return newWindow;
}

function addWindowFunctionality(windowElement) {
    const titleBar = windowElement.querySelector('.title-bar');    

    // Bring window to front on click, only if it doesn't have an inactive overlay
    windowElement.addEventListener('mousedown', (e) => {
        const overlay = windowElement.querySelector('.inactive-overlay');
        if (!overlay) {
            windowElement.style.zIndex = zIndexCounter++;
        }
    });

    // Drag and drop functionality
    titleBar.addEventListener('mousedown', (e) => {
        const overlay = windowElement.querySelector('.inactive-overlay');
        if (overlay) return; // Prevent dragging if window is inactive

        let shiftX = e.clientX - windowElement.getBoundingClientRect().left;
        let shiftY = e.clientY - windowElement.getBoundingClientRect().top;

        function moveAt(pageX, pageY) {
            windowElement.style.left = pageX - shiftX + 'px';
            windowElement.style.top = pageY - shiftY + 'px';
        }

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);

        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', onMouseMove);
        }, { once: true });
    });

   

    // Close functionality
    
}

function closeWindow(windowElement){
    windowElement.remove();
    // Remove inactive overlay from the next window in the stack
    const windows = document.querySelectorAll('.window');
    if (windows.length > 0) {
        const topWindow = windows[windows.length - 1];
        const overlay = topWindow.querySelector('.inactive-overlay');
        if (overlay) {
            overlay.remove();
        }
    } else {
        // If no windows are left, remove overlay from desktop controls
        const desktopControls = document.getElementById('desktop-controls');
        const overlay = desktopControls.querySelector('.inactive-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
}
