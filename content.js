// Function to wait for an element to be present in the DOM
const waitForElement = (selector, timeout = 10000) => {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            if (Date.now() - startTime > timeout) {
                reject(new Error(`Element ${selector} not found after ${timeout}ms`));
                return;
            }

            requestAnimationFrame(checkElement);
        };

        checkElement();
    });
};

// Function to wait for an element with specific text content
const waitForElementByText = (selector, text, timeout = 10000) => {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const checkElement = () => {
            const elements = document.querySelectorAll(selector);
            const element = Array.from(elements).find(el => el.textContent.includes(text));
            
            if (element) {
                resolve(element);
                return;
            }

            if (Date.now() - startTime > timeout) {
                reject(new Error(`Element ${selector} with text "${text}" not found after ${timeout}ms`));
                return;
            }

            requestAnimationFrame(checkElement);
        };

        checkElement();
    });
};

// Function to simulate a click event with all necessary mouse events
const simulateClick = (element) => {
    // Create all click events upfront
    const events = [
        new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            view: window
        }),
        new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            view: window
        }),
        new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        })
    ];

    // Dispatch all events in sequence
    for (const event of events) {
        element.dispatchEvent(event);
    }

    // Also try the native click method as fallback
    try {
        element.click();
    } catch (e) {
        console.log('Native click failed, but synthetic events were still dispatched');
    }
};

// Function to get URL parameter
const getUrlParameter = (name) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
};

// Function to simulate a single keystroke
const simulateKeystroke = (element, key) => {
    const keyDown = new KeyboardEvent('keydown', {
        key: key,
        code: `Key${key.toUpperCase()}`,
        keyCode: key.charCodeAt(0),
        which: key.charCodeAt(0),
        bubbles: true,
        cancelable: true,
        composed: true
    });
    element.dispatchEvent(keyDown);

    // Update input value
    const currentValue = element.value || '';
    element.value = currentValue + key;

    // Dispatch input event
    const inputEvent = new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        data: key,
        inputType: 'insertText'
    });
    element.dispatchEvent(inputEvent);

    const keyUp = new KeyboardEvent('keyup', {
        key: key,
        code: `Key${key.toUpperCase()}`,
        keyCode: key.charCodeAt(0),
        which: key.charCodeAt(0),
        bubbles: true,
        cancelable: true,
        composed: true
    });
    element.dispatchEvent(keyUp);
};

// Function to set input value and trigger events
const setInputValue = async (input, text) => {
    if (!input) {
        console.error("Input element not found.");
        return;
    }

    // Clear existing value
    input.value = '';
    input.dispatchEvent(new Event('change', { bubbles: true }));

    // Type each character with a small delay
    for (const char of text) {
        simulateKeystroke(input, char);
        // Add a small random delay between keystrokes
        await new Promise(resolve => setTimeout(resolve, 0));
    }

    // Final change event
    input.dispatchEvent(new Event('change', { bubbles: true }));
};

const wait = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// Main automation function
const automatePosthog = async () => {
    try {
        // Get session recording ID from URL
        const sessionRecordingId = getUrlParameter('sessionRecordingId');
        if (!sessionRecordingId) {
            console.log('No session recording ID found in URL');
            return;
        }

        // Click date range button
        const dateRangeButton = await waitForElement('#daterange_selector');
        simulateClick(dateRangeButton);


        // Wait for and click "All time" button
        const allTimeButton = await waitForElementByText('button.LemonButton--tertiary', 'All time');
        simulateClick(allTimeButton);

        // Wait for and click duration dropdown - target the button next to the date range button
        const durationButton = await waitForElement('.flex.flex-wrap.gap-2.items-center > button.LemonButton--secondary:not([data-attr="date-filter"])');
        simulateClick(durationButton);

        // Wait for and set duration input to 0
        const durationInput = await waitForElement('input[type="number"][placeholder="0"]');
        await setInputValue(durationInput, '0');

        // Wait for and click filters dropdown
        const filtersButton = await waitForElementByText('button.LemonButton--secondary', 'Add filter');
        simulateClick(filtersButton);

        // Wait for the taxonomic filter div to appear and then find the search input within it
        await waitForElement('.taxonomic-filter');
        const searchInput = await waitForElement('.taxonomic-filter input[data-attr="taxonomic-filter-searchfield"]');
        await setInputValue(searchInput, 'session id');

        const sessionIdRow = await waitForElementByText('.taxonomic-list-row', 'Session ID');

        searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));

        // Wait for and set session ID value
        const sessionIdInput = await waitForElement('div[data-attr="taxonomic-value-select"] input');

        await setInputValue(sessionIdInput, sessionRecordingId);

        sessionIdInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));

        // Simulate escape key to close the filter dropdown
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));


        console.log('PostHog automation completed successfully');
    } catch (error) {
        console.error('Error during PostHog automation:', error);
    }
};

// Check if we're on a PostHog page with session recording
if (window.location.href.includes('posthog.com') && window.location.href.includes('sessionRecordingId')) {
    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
        automatePosthog();
    } else {
        window.addEventListener('load', automatePosthog);
    }
} 