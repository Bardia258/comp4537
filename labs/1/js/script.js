import { USER_MESSAGES } from "../lang/messages/en/user.js";


class GameButton {
    constructor(orderNumber, parentElement, clickHandler) {
        this.orderNumber = orderNumber;
        this.parentElement = parentElement;
        this.clickHandler = clickHandler;
        this.element = document.createElement("button");

        this.create();
    }

    create() {
        this.element.classList.add("memory-button");
        this.element.textContent = this.orderNumber;
        this.element.disabled = true;

        this.setRandomColor();

        this.element.addEventListener("click", () => {
            this.clickHandler(this);
        });

        this.parentElement.appendChild(this.element);
    }

    setRandomColor() {
        const red = Math.floor(Math.random() * 256);
        const green = Math.floor(Math.random() * 256);
        const blue = Math.floor(Math.random() * 256);

        this.element.style.backgroundColor =
            `rgb(${red}, ${green}, ${blue})`;
    }

    moveToRandomPosition(viewWidth, viewHeight) {
        const buttonWidth = this.element.offsetWidth;
        const buttonHeight = this.element.offsetHeight;

        const maximumX = Math.max(0, viewWidth - buttonWidth);
        const maximumY = Math.max(0, viewHeight - buttonHeight);

        const randomX = Math.floor(Math.random() * (maximumX + 1));
        const randomY = Math.floor(Math.random() * (maximumY + 1));

        this.element.style.position = "fixed";
        this.element.style.left = `${randomX}px`;
        this.element.style.top = `${randomY}px`;
    }

    hideNumber() {
        this.element.textContent = "";
    }

    revealNumber() {
        this.element.textContent = this.orderNumber;
    }

    enable() {
        this.element.disabled = false;
    }

    disable() {
        this.element.disabled = true;
    }

    remove() {
        this.element.remove();
    }
}


class UserInterface {
    constructor(rootElement) {
        this.rootElement = rootElement;

        this.formArea = null;
        this.label = null;
        this.input = null;
        this.goButton = null;
        this.messageArea = null;
        this.buttonArea = null;

        this.createInterface();
    }

    createInterface() {
        document.title = USER_MESSAGES.PAGE_TITLE;

        this.formArea = document.createElement("div");
        this.formArea.classList.add("form-area");

        this.label = document.createElement("label");
        this.label.textContent = USER_MESSAGES.COUNT_LABEL;

        this.input = document.createElement("input");
        this.input.type = "number";
        this.input.min = "3";
        this.input.max = "7";
        this.input.step = "1";

        this.goButton = document.createElement("button");
        this.goButton.textContent = USER_MESSAGES.GO_BUTTON;

        this.messageArea = document.createElement("p");
        this.messageArea.classList.add("message-area");

        this.buttonArea = document.createElement("div");
        this.buttonArea.classList.add("button-area");

        this.formArea.appendChild(this.label);
        this.formArea.appendChild(this.input);
        this.formArea.appendChild(this.goButton);

        this.rootElement.appendChild(this.formArea);
        this.rootElement.appendChild(this.messageArea);
        this.rootElement.appendChild(this.buttonArea);
    }

    setGoButtonHandler(handler) {
        this.goButton.addEventListener("click", handler);
    }

    getRequestedButtonCount() {
        return Number(this.input.value);
    }

    showMessage(message) {
        this.messageArea.textContent = message;
    }

    clearMessage() {
        this.messageArea.textContent = "";
    }

    clearButtons() {
        this.buttonArea.replaceChildren();
    }
}


class MemoryGame {
    constructor(userInterface) {
        this.userInterface = userInterface;

        this.minimumButtons = 3;
        this.maximumButtons = 7;
        this.scrambleDelay = 2000;

        this.buttonCount = 0;
        this.buttons = [];
        this.expectedButtonNumber = 1;
        this.timerIds = [];
    }

    initialize() {
        this.userInterface.setGoButtonHandler(() => {
            this.startNewGame();
        });
    }

    startNewGame() {
        this.resetGame();

        const requestedCount =
            this.userInterface.getRequestedButtonCount();

        if (!this.isValidButtonCount(requestedCount)) {
            this.userInterface.showMessage(
                USER_MESSAGES.INVALID_COUNT
            );
            return;
        }

        this.buttonCount = requestedCount;

        this.createButtons();

        const initialPause = this.buttonCount * 1000;

        const timerId = setTimeout(() => {
            this.scrambleButtons(1);
        }, initialPause);

        this.timerIds.push(timerId);
    }

    isValidButtonCount(value) {
        return (
            Number.isInteger(value) &&
            value >= this.minimumButtons &&
            value <= this.maximumButtons
        );
    }

    createButtons() {
        for (let number = 1; number <= this.buttonCount; number++) {
            const gameButton = new GameButton(
                number,
                this.userInterface.buttonArea,
                (clickedButton) => {
                    this.handleButtonClick(clickedButton);
                }
            );

            this.buttons.push(gameButton);
        }
    }

    scrambleButtons(scrambleNumber) {

        const currentWindowWidth = window.innerWidth;
        const currentWindowHeight = window.innerHeight;

        this.buttons.forEach((button) => {
            button.moveToRandomPosition(
                currentWindowWidth,
                currentWindowHeight
            );
        });

        if (scrambleNumber < this.buttonCount) {
            const timerId = setTimeout(() => {
                this.scrambleButtons(scrambleNumber + 1);
            }, this.scrambleDelay);

            this.timerIds.push(timerId);
            return;
        }

        this.beginMemoryTest();
    }

    beginMemoryTest() {
        this.buttons.forEach((button) => {
            button.hideNumber();
            button.enable();
        });

        this.expectedButtonNumber = 1;
    }

    handleButtonClick(clickedButton) {
        if (
            clickedButton.orderNumber ===
            this.expectedButtonNumber
        ) {
            clickedButton.revealNumber();
            clickedButton.disable();

            this.expectedButtonNumber++;

            if (this.expectedButtonNumber > this.buttonCount) {
                this.finishWithSuccess();
            }

            return;
        }

        this.finishWithFailure();
    }

    finishWithSuccess() {
        this.disableAllButtons();

        this.userInterface.showMessage(
            USER_MESSAGES.EXCELLENT_MEMORY
        );
    }

    finishWithFailure() {
        this.buttons.forEach((button) => {
            button.revealNumber();
            button.disable();
        });

        this.userInterface.showMessage(
            USER_MESSAGES.WRONG_ORDER
        );
    }

    disableAllButtons() {
        this.buttons.forEach((button) => {
            button.disable();
        });
    }

    cancelTimers() {
        this.timerIds.forEach((timerId) => {
            clearTimeout(timerId);
        });

        this.timerIds = [];
    }

    resetGame() {
        this.cancelTimers();

        this.buttons.forEach((button) => {
            button.remove();
        });

        this.buttons = [];
        this.buttonCount = 0;
        this.expectedButtonNumber = 1;

        this.userInterface.clearButtons();
        this.userInterface.clearMessage();
    }
}



const userInterface = new UserInterface(
    document.getElementById("app")
);

const memoryGame = new MemoryGame(userInterface);

memoryGame.initialize();